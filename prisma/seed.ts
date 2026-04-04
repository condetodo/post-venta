import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // --- Admin user ---
  const hashedPassword = await bcrypt.hash('admin', 10)
  await prisma.user.upsert({
    where: { email: 'admin' },
    update: { password: await bcrypt.hash('admin', 10) },
    create: {
      email: 'admin',
      password: hashedPassword,
      nombre: 'Admin',
    },
  })
  console.log('Admin user created: admin / admin')

  // --- Concesionario ---
  const concesionario = await prisma.concesionario.upsert({
    where: { id: 'seed-concesionario-01' },
    update: {},
    create: {
      id: 'seed-concesionario-01',
      nombre: 'Automotores del Sur',
      marca: 'Toyota',
      ciudad: 'Neuquen',
      elevadores: 8,
      horasOperativas: 10,
      diasOperativos: 22,
      costoFijoMensual: 15000000,
      ticketPromedio: 180000,
      ocupacionActual: 55,
      mixMecanica: 55,
      mixChapa: 30,
      mixExpress: 15,
    },
  })
  console.log(`Concesionario created: ${concesionario.nombre}`)

  // --- 50 Clientes ---
  const nombres = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Roberto Fernández', 'Laura González', 'Diego Rodríguez', 'Sofía Sánchez',
    'Martín Romero', 'Valentina Torres', 'Lucas Díaz', 'Camila Ruiz',
    'Nicolás Álvarez', 'Florencia Gómez', 'Matías Moreno', 'Julieta Jiménez',
    'Sebastián Herrera', 'Paula Medina', 'Facundo Castro', 'Agustina Vargas',
    'Federico Ortiz', 'Daniela Gutiérrez', 'Tomás Silva', 'Carolina Rojas',
    'Alejandro Molina', 'Luciana Acosta', 'Ignacio Domínguez', 'Milagros Suárez',
    'Ezequiel Peralta', 'Rocío Cabrera', 'Santiago Flores', 'Belén Aguirre',
    'Maximiliano Ríos', 'Aldana Navarro', 'Rodrigo Campos', 'Celeste Reyes',
    'Gonzalo Herrera', 'Antonella Paz', 'Leandro Bustos', 'Sol Figueroa',
    'Hernán Correa', 'Micaela Luna', 'Emiliano Escobar', 'Pilar Vera',
    'Franco Soria', 'Guadalupe Ojeda', 'Ramiro Mansilla', 'Irina Ledesma',
    'Hugo Vidal', 'Mariela Paredes',
  ]

  const modelos = ['Corolla', 'Hilux', 'Yaris', 'SW4', 'Etios', 'Camry', 'RAV4']

  // Deterministic seed helper
  function seededValue(index: number, min: number, max: number): number {
    return min + (index % (max - min + 1))
  }

  function generatePatente(index: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const l1 = letters[index % 26]
    const l2 = letters[(index * 3 + 7) % 26]
    const n1 = ((index * 17 + 3) % 900) + 100 // 100-999
    const l3 = letters[(index * 5 + 13) % 26]
    const l4 = letters[(index * 7 + 2) % 26]
    return `${l1}${l2}${n1}${l3}${l4}`
  }

  const now = new Date()

  const clientes = nombres.map((nombre, i) => {
    const modelo = modelos[i % modelos.length]
    const anio = 2018 + (i % 8) // 2018-2025
    const kmActual = 5000 + seededValue(i * 7, 0, 115) * 1000 // 5000-120000
    // Spread ultimoService across last 18 months
    const monthsAgo = i < 10 ? (i % 3) + 1     // first 10: 1-3 months ago (recent)
      : i < 30 ? 3 + (i % 6)                    // next 20: 3-8 months ago (mid)
      : 8 + (i % 11)                             // last 20: 8-18 months ago (overdue)
    const ultimoService = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 10 + (i % 20))
    const hasEmail = i % 3 !== 2 // ~2/3 have email
    const emailBase = nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.')
    const telefono = `+54299${(4550000 + i * 137).toString()}`
    const cantidadVisitas = 1 + (i % 6)
    const ticketAcumulado = cantidadVisitas * (120000 + seededValue(i * 3, 0, 80) * 1000)

    return {
      nombre,
      telefono,
      email: hasEmail ? `${emailBase}@gmail.com` : null,
      marca: 'Toyota',
      modelo,
      anio,
      patente: generatePatente(i),
      kmActual,
      ultimoService,
      cantidadVisitas,
      ticketAcumulado,
      segmento: i % 4 === 0 ? 'premium' : i % 4 === 1 ? 'frecuente' : i % 4 === 2 ? 'ocasional' : 'nuevo',
      estado: 'activo',
      concesionarioId: concesionario.id,
    }
  })

  const result = await prisma.cliente.createMany({
    data: clientes,
    skipDuplicates: true,
  })
  console.log(`Clientes created: ${result.count}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
