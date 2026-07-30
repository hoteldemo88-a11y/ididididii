import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function initDB() {
  const client = await pool.connect()
  try {
    await client.query(`
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

      CREATE TABLE IF NOT EXISTS sms_codes (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) REFERENCES sessions(session_id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
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
