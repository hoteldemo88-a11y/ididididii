import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import QRPage from './pages/QRPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { api } from './services/api'

export default function App() {
  const [view, setView] = useState<'login' | 'qr' | 'admin-login' | 'admin'>((): any => {
    const h = window.location.hash.replace('#', '')
    if (h === 'admin') return localStorage.getItem('admin_token') ? 'admin' : 'admin-login'
    return 'login'
  })
  const [sessionId, setSessionId] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try { await api.adminVerify(); setView('admin') } catch { localStorage.removeItem('admin_token'); setView('admin-login') }
      }
    }
    if (view === 'admin') checkAuth()
  }, [])

  if (view === 'admin-login') {
    return <AdminLogin onLogin={() => { window.location.hash = '#admin'; setView('admin') }} />
  }

  if (view === 'admin') {
    return <AdminDashboard onLogout={() => { localStorage.removeItem('admin_token'); setView('admin-login') }} />
  }

  if (view === 'qr' && sessionId) {
    return <QRPage sessionId={sessionId} userId={userId} onBack={() => { setView('login'); setSessionId('') }} />
  }

  return (
    <LoginPage
      onSessionCreated={(sid, uid) => { setSessionId(sid); setUserId(uid); setView('qr') }}
    />
  )
}
