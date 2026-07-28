// StayPilot V5 — Simple JWT auth (replaces NextAuth for reliability in dev + Vercel)
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from './db'

export interface AppUser {
  id: string
  email: string
  name: string
  role: string
  isDemo: boolean
}

// Simple base64url encode/decode for JWT (no external crypto needed)
function base64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

function signJwt(payload: AppUser): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  const body = base64url({ ...payload, iat: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })
  const secret = process.env.NEXTAUTH_SECRET || 'staypilot-v5-secret-key-2024-very-long'
  // Simple HMAC using Node crypto
  
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

function verifyJwt(token: string): AppUser | null {
  try {
    const [header, body, sig] = token.split('.')
    if (!header || !body || !sig) return null
    const secret = process.env.NEXTAUTH_SECRET || 'staypilot-v5-secret-key-2024-very-long'
    
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
    if (sig !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp && Date.now() > payload.exp) return null
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role, isDemo: payload.isDemo }
  } catch {
    return null
  }
}

const COOKIE_NAME = 'staypilot-session'

export async function loginUser(email: string, password: string): Promise<{ user: AppUser; token: string } | null> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user || user.status !== 'active') return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  const appUser: AppUser = { id: user.id, email: user.email, name: user.name, role: user.role, isDemo: user.isDemo }
  const token = signJwt(appUser)
  return { user: appUser, token }
}

export function getSessionFromRequest(req: Request): AppUser | null {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return verifyJwt(match[1])
}

export const SESSION_COOKIE = COOKIE_NAME
export const COOKIE_OPTIONS = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000'

// Helper for API routes
export async function getAuthUser(req: Request): Promise<AppUser | null> {
  return getSessionFromRequest(req)
}
