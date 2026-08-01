import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const EMAIL = process.env.ADMIN_EMAIL || 'admin@mitid.com'
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SECRET = process.env.JWT_SECRET || 'mitid_admin_secret_key_2026'

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    if (email !== EMAIL) return res.status(401).json({ error: 'Invalid credentials' })

    const result = await pool.query('SELECT password_hash FROM admins WHERE email = $1', [email])
    if (result.rows.length === 0) {
      const hash = bcrypt.hashSync(PASSWORD, 10)
      await pool.query('INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING', [email, hash])
      if (!bcrypt.compareSync(password, hash)) return res.status(401).json({ error: 'Invalid credentials' })
    } else {
      if (!bcrypt.compareSync(password, result.rows[0].password_hash)) return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ email, role: 'admin' }, SECRET, { expiresIn: '24h' })
    res.json({ token, email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

router.get('/verify', (req, res) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    jwt.verify(header.split(' ')[1], SECRET)
    res.json({ valid: true })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' })
    if (newPassword.length < 4) return res.status(400).json({ error: 'New password must be at least 4 characters' })

    const result = await pool.query('SELECT password_hash FROM admins WHERE email = $1', [EMAIL])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Admin not found' })

    if (!bcrypt.compareSync(currentPassword, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHash = bcrypt.hashSync(newPassword, 10)
    await pool.query('UPDATE admins SET password_hash = $1 WHERE email = $2', [newHash, EMAIL])
    res.json({ ok: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal error' })
  }
})

export default router
