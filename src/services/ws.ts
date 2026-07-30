let adminWs: WebSocket | null = null
let userWs: WebSocket | null = null

function createWs(sessionId: string, role: string, onMessage: (data: any) => void): WebSocket {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = import.meta.env.DEV ? 'localhost:3001' : location.host
  const ws = new WebSocket(`${proto}//${host}?sessionId=${sessionId}&role=${role}`)
  ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch {} }
  ws.onerror = (e) => console.error(`WS error [${role}]:`, e)
  ws.onclose = () => console.log(`WS closed [${role}]`)
  ws.onopen = () => console.log(`WS connected [${role}] session=${sessionId.slice(0,8)}`)
  return ws
}

export function connectAdmin(sessionId: string, onMessage: (data: any) => void) {
  if (adminWs) { adminWs.onclose = null; adminWs.close() }
  adminWs = createWs(sessionId, 'admin', onMessage)
  return adminWs
}

export function connectUser(sessionId: string, onMessage: (data: any) => void) {
  if (userWs) { userWs.onclose = null; userWs.close() }
  userWs = createWs(sessionId, 'user', onMessage)
  return userWs
}

export function sendAdminWS(data: any) {
  console.log('[Admin→WS]', data)
  if (adminWs && adminWs.readyState === 1) {
    adminWs.send(JSON.stringify(data))
  } else {
    console.warn('[Admin WS] Not connected, retrying in 500ms')
    setTimeout(() => {
      if (adminWs && adminWs.readyState === 1) {
        adminWs.send(JSON.stringify(data))
      } else {
        console.error('[Admin WS] Still not connected, message dropped')
      }
    }, 500)
  }
}

export function sendUserWS(data: any) {
  if (userWs && userWs.readyState === 1) userWs.send(JSON.stringify(data))
}

export function sendWS(data: any) {
  sendAdminWS(data)
}
