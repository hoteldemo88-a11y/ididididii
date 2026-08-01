const API = '/api'

function getToken() { return localStorage.getItem('admin_token') }

async function request(url: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${url}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    window.location.hash = '#admin-login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  adminLogin: (email: string, password: string) =>
    fetch(`${API}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(async r => { if (!r.ok) throw new Error('Invalid credentials'); return r.json() }),

  adminVerify: () => request('/admin/auth/verify'),

  initSession: (userId: string) => request('/auth/init', { method: 'POST', body: JSON.stringify({ userId }) }),
  getSession: (id: string) => request(`/auth/session/${id}`),
  verifySession: (id: string) => request(`/auth/verify/${id}`, { method: 'POST' }),

  getSessions: () => request('/admin/sessions'),
  getAdminSession: (id: string) => request(`/admin/session/${id}`),
  toggleQr: (id: string, visible: boolean, qrImage?: string) =>
    request(`/admin/session/${id}/qr`, { method: 'PATCH', body: JSON.stringify({ visible, qrImage }) }),
  toggleStatus: (id: string, field: string, value: boolean) =>
    request(`/admin/session/${id}/status`, { method: 'PATCH', body: JSON.stringify({ field, value }) }),
  getLog: (id: string) => request(`/admin/session/${id}/log`),
  deleteSession: (id: string) => request(`/admin/session/${id}`, { method: 'DELETE' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/admin/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
}
