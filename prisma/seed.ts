import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@telemetria.com' },
    update: {},
    create: {
      email: 'admin@telemetria.com',
      password: hashedPassword,
      nombre: 'Admin',
    },
  })
  console.log('Admin user created: admin@telemetria.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
