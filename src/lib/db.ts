import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// V5: The sandbox sets a system DATABASE_URL (SQLite) that shadows .env.
// On Vercel, the env var is set correctly in the dashboard. For local dev,
// read the Neon URL from .env directly if the system env is the SQLite shadow.
function resolveDbUrl(): string {
  const sysUrl = process.env.DATABASE_URL
  if (sysUrl && sysUrl.startsWith('postgresql://')) return sysUrl
  // System env is the SQLite shadow (or missing) — read from .env file
  try {
    const envPath = path.join(process.cwd(), '.env')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const match = envContent.match(/^DATABASE_URL=(.+)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, '')
  } catch { /* */ }
  return sysUrl || 'file:./dev.db'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    datasources: {
      db: {
        url: resolveDbUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
