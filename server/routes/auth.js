import { Router } from 'express'
import crypto from 'crypto'
import pool from '../db.js'

const router = Router()

router.post('/init', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const sessionId = crypto.randomBytes(32).toString('hex')
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await pool.query(
      `INSERT INTO sessions (session_id, user_id, verification_code) VALUES ($1, $2, $3)`,
      [sessionId, userId, verificationCode]
    )
    await pool.query(
      `INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'session_created', $2)`,
      [sessionId, `User ${userId} initiated login`]
    )

    res.json({ sessionId, userId })
  } catch (err) {
    console.error('Init error:', err)
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

router.post('/verify/:sessionId', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE sessions SET status = 'verified', verified_at = NOW(), updated_at = NOW()
       WHERE session_id = $1 AND status = 'pending' RETURNING *`,
      [req.params.sessionId]
    )
    if (result.rows.length === 0) return res.status(400).json({ error: 'Not found or already verified' })
    await pool.query(
      `INSERT INTO auth_log (session_id, event_type, detail) VALUES ($1, 'verified', 'QR code scanned')`,
      [req.params.sessionId]
    )
    res.json({ status: 'verified' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

export default router
