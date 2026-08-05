import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const envFile = readFileSync(join(__dirname, '..', '.env'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new pg.Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'mitid',
      password: process.env.DB_PASSWORD || 'mitid123',
      port: parseInt(process.env.DB_PORT || '5432'),
    })

export async function initDB() {
  const client = await pool.connect()
  try {
    await client.query(`
      DROP TABLE IF EXISTS sms_codes;

      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) UNIQUE NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        status VARCHAR(32) DEFAULT 'pending',
        qr_visible BOOLEAN DEFAULT false,
        qr_image TEXT,
        sms_active BOOLEAN DEFAULT false,
        otp_active BOOLEAN DEFAULT false,
        kode_active BOOLEAN DEFAULT false,
        verification_code VARCHAR(10),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS auth_log (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        detail TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log('Database tables ready')
  } finally {
    client.release()
  }
}

export default pool
