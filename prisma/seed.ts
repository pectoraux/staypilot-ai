// Seed: creates the admin account + 6 demo accounts for quick login.
// Run: bun run seed
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const accounts = [
    { email: 'ekontetevi@gmail.com', password: 'Payswap123456', name: 'Ekonte Tetevi', role: 'Admin', isDemo: false },
    { email: 'demo-owner@staypilot.ai', password: 'demo123', name: 'Kwesi Owner', role: 'Owner', isDemo: true },
    { email: 'demo-manager@staypilot.ai', password: 'demo123', name: 'Abena Manager', role: 'Manager', isDemo: true },
    { email: 'demo-receptionist@staypilot.ai', password: 'demo123', name: 'Akosua Reception', role: 'Receptionist', isDemo: true },
    { email: 'demo-marketing@staypilot.ai', password: 'demo123', name: 'Ama Marketing', role: 'Marketing Manager', isDemo: true },
    { email: 'demo-housekeeping@staypilot.ai', password: 'demo123', name: 'Akua Housekeeping', role: 'Housekeeping', isDemo: true },
    { email: 'demo-admin@staypilot.ai', password: 'demo123', name: 'Nana Admin', role: 'Admin', isDemo: true },
  ]

  for (const acc of accounts) {
    const passwordHash = await bcrypt.hash(acc.password, 10)
    await db.user.upsert({
      where: { email: acc.email },
      update: { passwordHash, name: acc.name, role: acc.role, isDemo: acc.isDemo, status: 'active' },
      create: { email: acc.email, passwordHash, name: acc.name, role: acc.role, isDemo: acc.isDemo, status: 'active' },
    })
    console.log(`✓ ${acc.email} (${acc.role})${acc.isDemo ? ' [demo]' : ''}`)
  }
  console.log('\nSeed complete.')
  console.log('Admin login: ekontetevi@gmail.com / Payswap123456')
  console.log('Demo logins: demo-<role>@staypilot.ai / demo123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
