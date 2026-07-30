import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'fallback_secret'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' })
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], SECRET)
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
