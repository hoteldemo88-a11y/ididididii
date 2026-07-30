import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import dotenv from 'dotenv'
import { initDB } from './db.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import adminAuthRoutes from './routes/adminAuth.js'
import { setupWebSocket } from './websocket.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/{*splat}', (_, res) => res.sendFile(join(distPath, 'index.html')))
  console.log(`Serving frontend from ${distPath}`)
}

setupWebSocket(server)

const PORT = process.env.PORT || 3001

await initDB()
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
