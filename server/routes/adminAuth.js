import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

const EMAIL = process.env.ADMIN_EMAIL || 'admin@mitid.com'
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SECRET = process.env.JWT_SECRET || 'mitid_admin_secret_key_2026'

const passwordHash = bcrypt.hashSync(PASSWORD, 10)

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    if (email !== EMAIL) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = bcrypt.compareSync(password, passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

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

export default router
