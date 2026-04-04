# Telemetria Posventa - Implementation Plan (MVP)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the MVP: project setup, auth, CRUD concesionarios with Excel import, and the diagnostico module (brecha calculation + visualization).

**Architecture:** Next.js 15 App Router with server components by default, client components only where interactivity is needed. Prisma ORM talks to PostgreSQL. NextAuth.js handles single-admin auth. All API routes under `/api/`. Shared layout with sidebar navigation.

**Tech Stack:** Next.js 15, React, Tailwind CSS, Prisma, PostgreSQL, NextAuth.js, SheetJS (xlsx), Recharts, Lucide React, @anthropic-ai/sdk

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `next.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

**Step 1: Initialize Next.js project**

Run:
```bash
cd C:/proyectos/post-venta
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Expected: Project scaffolded with App Router, TypeScript, Tailwind.

**Step 2: Install all dependencies**

Run:
```bash
npm install prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs xlsx recharts lucide-react @anthropic-ai/sdk
npm install -D @types/bcryptjs
```

**Step 3: Create .env.example**

Create `.env.example`:
```
DATABASE_URL=postgresql://user:password@host:5432/telemetria_posventa
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=generate-a-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Create `.env` with the same content (will be gitignored).

**Step 4: Update .gitignore**

Add to `.gitignore`:
```
.env
.env.local
```

**Step 5: Update tailwind.config.ts with project colors**

Extend the theme in `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        orange: '#D85A30',
        blue: '#378ADD',
        green: '#1D9E75',
      }
    }
  }
}
```

**Step 6: Verify dev server starts**

Run: `npm run dev`
Expected: App running on localhost:3000

**Step 7: Initialize git and commit**

Run:
```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project with dependencies"
```

---

## Task 2: Prisma Schema and Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Step 1: Initialize Prisma**

Run: `npx prisma init`

**Step 2: Write the full schema**

Replace `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  nombre    String
  createdAt DateTime @default(now())
}

model Concesionario {
  id               String   @id @default(cuid())
  nombre           String
  ciudad           String
  marca            String
  elevadores       Int
  horasOperativas  Int      @default(10)
  diasOperativos   Int      @default(22)
  costoFijoMensual Float    @default(0)
  ticketPromedio   Float    @default(0)
  ocupacionActual  Float    @default(50)
  mixMecanica      Float    @default(40)
  mixChapa         Float    @default(30)
  mixExpress       Float    @default(30)
  notas            String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  clientes  Cliente[]
  campanas  Campana[]
  registros RegistroTelemetria[]
}

model Cliente {
  id              String    @id @default(cuid())
  nombre          String
  telefono        String?
  email           String?
  marca           String
  modelo          String
  anio            Int
  patente         String?
  kmActual        Int?
  ultimoService   DateTime?
  cantidadVisitas Int       @default(0)
  ticketAcumulado Float     @default(0)
  segmento        String?
  scoreRenovacion Float?
  diasSinVisita   Int?
  estado          String    @default("activo")

  concesionario   Concesionario @relation(fields: [concesionarioId], references: [id], onDelete: Cascade)
  concesionarioId String
  campanaClientes CampanaCliente[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([concesionarioId, patente])
}

model Campana {
  id                  String   @id @default(cuid())
  nombre              String
  tipo                String
  segmento            String
  canal               String
  estado              String   @default("borrador")
  mensajeTemplate     String?
  mensajeIA           String?
  argumento           String?
  clientesTarget      Int      @default(0)
  clientesContactados Int      @default(0)
  turnosAgendados     Int      @default(0)
  turnosCompletados   Int      @default(0)
  ventasGeneradas     Int      @default(0)
  ingresoGenerado     Float    @default(0)

  concesionario   Concesionario @relation(fields: [concesionarioId], references: [id], onDelete: Cascade)
  concesionarioId String
  campanaClientes CampanaCliente[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model CampanaCliente {
  id             String   @id @default(cuid())
  estado         String   @default("pendiente")
  mensajeEnviado String?
  respuesta      String?
  montoGenerado  Float    @default(0)

  campana   Campana @relation(fields: [campanaId], references: [id], onDelete: Cascade)
  campanaId String
  cliente   Cliente @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  clienteId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RegistroTelemetria {
  id                 String   @id @default(cuid())
  fecha              DateTime @default(now())
  turnosDelDia       Int
  elevadoresUsados   Int
  ingresoDia         Float
  mixMecanica        Float
  mixChapa           Float
  mixExpress         Float
  oportunidadesVenta Int      @default(0)
  ventasCerradas     Int      @default(0)

  concesionario   Concesionario @relation(fields: [concesionarioId], references: [id], onDelete: Cascade)
  concesionarioId String
}
```

**Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 4: Push schema to database**

Run: `npx prisma db push`
Expected: Schema synced to PostgreSQL.

**Step 5: Generate Prisma client**

Run: `npx prisma generate`

**Step 6: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema with all models"
```

---

## Task 3: NextAuth.js Setup

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create auth config**

Create `src/lib/auth.ts`:
```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.nombre }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
}
```

**Step 2: Create API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**Step 3: Create SessionProvider wrapper**

Create `src/components/providers.tsx`:
```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

**Step 4: Create login page**

Create `src/app/login/page.tsx`:
```tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Credenciales incorrectas')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Telemetria Posventa</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" name="password" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 5: Create seed script to create admin user**

Create `prisma/seed.ts`:
```typescript
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
```

Add to `package.json`:
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx: `npm install -D tsx`

Run: `npx prisma db seed`

**Step 6: Wire providers into layout**

Update `src/app/layout.tsx` to wrap children with `<Providers>`.

**Step 7: Add auth middleware**

Create `src/middleware.ts`:
```typescript
export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/concesionarios/:path*'],
}
```

**Step 8: Verify login flow works**

Run: `npm run dev`, navigate to `/login`, sign in with `admin@telemetria.com` / `admin123`.
Expected: Redirect to `/dashboard`.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth.js with credentials provider and login page"
```

---

## Task 4: Shared Layout and Navigation

**Files:**
- Create: `src/components/sidebar.tsx`
- Create: `src/app/(authenticated)/layout.tsx`
- Create: `src/app/(authenticated)/dashboard/page.tsx`
- Create: `src/lib/format.ts`

**Step 1: Create currency/number formatting utility**

Create `src/lib/format.ts`:
```typescript
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}
```

**Step 2: Create sidebar component**

Create `src/components/sidebar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/concesionarios', label: 'Concesionarios', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold">Telemetria</h1>
        <p className="text-xs text-gray-500">Posventa Inteligente</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive ? 'bg-gray-100 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 w-full"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </aside>
  )
}
```

**Step 3: Create authenticated layout with route group**

Create `src/app/(authenticated)/layout.tsx`:
```tsx
import { Sidebar } from '@/components/sidebar'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

**Step 4: Create dashboard placeholder**

Create `src/app/(authenticated)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-500">Carga tu primer concesionario para comenzar.</p>
    </div>
  )
}
```

**Step 5: Move login outside route group, update root page to redirect**

Update `src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

**Step 6: Verify layout renders with sidebar**

Run: `npm run dev`, login, verify sidebar + dashboard render.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add sidebar layout with navigation and formatting utils"
```

---

## Task 5: Concesionarios CRUD - API Routes

**Files:**
- Create: `src/app/api/concesionarios/route.ts` (GET list, POST create)
- Create: `src/app/api/concesionarios/[id]/route.ts` (GET one, PUT update, DELETE)

**Step 1: Create GET/POST route**

Create `src/app/api/concesionarios/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const concesionarios = await prisma.concesionario.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { clientes: true, campanas: true } } },
  })
  return NextResponse.json(concesionarios)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const concesionario = await prisma.concesionario.create({ data: body })
  return NextResponse.json(concesionario, { status: 201 })
}
```

**Step 2: Create GET/PUT/DELETE by id route**

Create `src/app/api/concesionarios/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
    include: { _count: { select: { clientes: true, campanas: true } } },
  })
  if (!concesionario) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(concesionario)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const concesionario = await prisma.concesionario.update({ where: { id }, data: body })
  return NextResponse.json(concesionario)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.concesionario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

**Step 3: Verify with curl or browser**

Run: `npm run dev`
Test: `curl http://localhost:3000/api/concesionarios`
Expected: `[]`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add concesionarios CRUD API routes"
```

---

## Task 6: Concesionarios CRUD - UI Pages

**Files:**
- Create: `src/app/(authenticated)/concesionarios/page.tsx`
- Create: `src/app/(authenticated)/concesionarios/nuevo/page.tsx`
- Create: `src/app/(authenticated)/concesionarios/[id]/page.tsx`
- Create: `src/components/concesionario-form.tsx`

**Step 1: Create the concesionario form component**

Create `src/components/concesionario-form.tsx` with fields for:
- nombre, ciudad, marca (text inputs)
- elevadores (number), horasOperativas (number, default 10), diasOperativos (number, default 22)
- costoFijoMensual, ticketPromedio (number with ARS formatting)
- ocupacionActual (range slider 0-100 with percentage display)
- mixMecanica, mixChapa, mixExpress (three number inputs that should sum to 100, with validation)
- notas (textarea)

Use `'use client'`, controlled form with `useState`, submit via `fetch` to API.

**Step 2: Create "nuevo" page**

Create `src/app/(authenticated)/concesionarios/nuevo/page.tsx` that renders `<ConcesionarioForm />` and on success redirects to `/concesionarios`.

**Step 3: Create list page**

Create `src/app/(authenticated)/concesionarios/page.tsx`:
- Fetch concesionarios from API
- Display as cards with nombre, ciudad, marca, ocupacion badge, client count
- "Nuevo Concesionario" button in header
- Each card links to `/concesionarios/[id]`

**Step 4: Create detail page (hub)**

Create `src/app/(authenticated)/concesionarios/[id]/page.tsx`:
- Fetch concesionario by id
- Show header with nombre, ciudad, marca
- Quick stats: elevadores, ocupacion, clientes count
- Navigation cards to submodules: Diagnostico, Pipeline, Matching, Telemetria
- Edit and Delete buttons

**Step 5: Verify full CRUD flow**

Create a concesionario, see it in the list, click into detail, edit, delete.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add concesionarios list, create, and detail pages"
```

---

## Task 7: Excel/CSV Import for Clientes

**Files:**
- Create: `src/app/api/concesionarios/[id]/clientes/route.ts`
- Create: `src/app/api/concesionarios/[id]/clientes/import/route.ts`
- Create: `src/components/import-clientes.tsx`
- Create: `src/app/(authenticated)/concesionarios/[id]/clientes/page.tsx`

**Step 1: Create clientes API routes**

Create `src/app/api/concesionarios/[id]/clientes/route.ts` with:
- GET: list clientes for concesionario with pagination
- POST: create single cliente

Create `src/app/api/concesionarios/[id]/clientes/import/route.ts` with:
- POST: receive parsed array of clientes, validate, deduplicate by patente, bulk create
- Use `prisma.cliente.createMany({ skipDuplicates: true })`

**Step 2: Create import component**

Create `src/components/import-clientes.tsx` (client component):

1. File upload dropzone (accept .xlsx, .csv)
2. On file select: parse with `xlsx` library, read first sheet
3. Show preview table of first 10 rows
4. Column mapping: for each required field (nombre, marca, modelo, anio), show a `<select>` dropdown with detected column headers
5. Optional fields: telefono, email, patente, kmActual, ultimoService
6. Phone validation: Argentine format (starts with +54 or number, 10-13 digits)
7. "Importar" button: map rows according to column mapping, POST to import API
8. Progress bar during import
9. Show result: X importados, Y duplicados, Z errores

**Step 3: Create clientes page**

Create `src/app/(authenticated)/concesionarios/[id]/clientes/page.tsx`:
- Table with all clientes (nombre, modelo, anio, patente, segmento, estado)
- Import button that opens the import component
- Search/filter by nombre or patente

**Step 4: Verify import flow**

Create a test Excel file with 5 rows, upload, map columns, import.
Expected: 5 clientes created, visible in table.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add clientes list and Excel/CSV import with column mapping"
```

---

## Task 8: Diagnostico Module - Brecha Calculation

**Files:**
- Create: `src/lib/diagnostico.ts`
- Create: `src/app/api/concesionarios/[id]/diagnostico/route.ts`
- Create: `src/app/(authenticated)/concesionarios/[id]/diagnostico/page.tsx`
- Create: `src/components/diagnostico/grilla-elevadores.tsx`
- Create: `src/components/diagnostico/gauge-absorcion.tsx`
- Create: `src/components/diagnostico/mix-chart.tsx`
- Create: `src/components/diagnostico/alerta-brecha.tsx`
- Create: `src/components/diagnostico/resumen-ejecutivo.tsx`

**Step 1: Create diagnostico calculation logic**

Create `src/lib/diagnostico.ts`:
```typescript
export interface DiagnosticoResult {
  capacidadInstalada: number      // turnos/mes totales
  turnosActuales: number          // turnos/mes ocupados
  brecha: number                  // turnos/mes sin cubrir
  ingresoActual: number           // ARS/mes
  ingresoNoCaptado: number        // ARS/mes
  ingresoPotencial: number        // ARS/mes (actual + no captado)
  absorcionActual: number         // % cobertura costo fijo
  absorcionPotencial: number      // % si se llenara la brecha
  autosFaltantesDia: number       // por dia
  turnosFaltantesDia: number      // por dia
  ocupacionObjetivo: number       // siempre 85% como target realista
}

export interface ConcesionarioInput {
  elevadores: number
  horasOperativas: number
  diasOperativos: number
  costoFijoMensual: number
  ticketPromedio: number
  ocupacionActual: number
}

const HORAS_POR_TURNO = 1.5

export function calcularDiagnostico(input: ConcesionarioInput): DiagnosticoResult {
  const capacidadInstalada = input.elevadores * (input.horasOperativas / HORAS_POR_TURNO) * input.diasOperativos
  const turnosActuales = Math.round(capacidadInstalada * (input.ocupacionActual / 100))
  const brecha = capacidadInstalada - turnosActuales

  const ingresoActual = turnosActuales * input.ticketPromedio
  const ingresoNoCaptado = brecha * input.ticketPromedio
  const ingresoPotencial = ingresoActual + ingresoNoCaptado

  const absorcionActual = input.costoFijoMensual > 0
    ? (ingresoActual / input.costoFijoMensual) * 100
    : 0
  const absorcionPotencial = input.costoFijoMensual > 0
    ? (ingresoPotencial / input.costoFijoMensual) * 100
    : 0

  const autosFaltantesDia = Math.round(brecha / input.diasOperativos)
  const turnosFaltantesDia = brecha / input.diasOperativos

  return {
    capacidadInstalada,
    turnosActuales,
    brecha,
    ingresoActual,
    ingresoNoCaptado,
    ingresoPotencial,
    absorcionActual,
    absorcionPotencial,
    autosFaltantesDia,
    turnosFaltantesDia,
    ocupacionObjetivo: 85,
  }
}
```

**Step 2: Create diagnostico API route**

Create `src/app/api/concesionarios/[id]/diagnostico/route.ts`:
- GET: fetch concesionario, run `calcularDiagnostico()`, return result
- Pure calculation, no DB write needed (derived from concesionario data)

**Step 3: Create grilla-elevadores component**

Create `src/components/diagnostico/grilla-elevadores.tsx`:
- Grid of cards, one per elevador
- Each card shows: elevador number, status (lleno/vacio based on ocupacion)
- Filled elevadores in dark, empty in light with dashed border
- Count of filled vs total at bottom

**Step 4: Create gauge-absorcion component**

Create `src/components/diagnostico/gauge-absorcion.tsx`:
- Semicircular gauge using Recharts PieChart (180 degree)
- Show absorcionActual as filled portion
- Zones: rojo (<80%), amarillo (80-100%), verde (>100%)
- Center text: current absorcion percentage
- Below: "Actual: X% | Potencial: Y%"

**Step 5: Create mix-chart component**

Create `src/components/diagnostico/mix-chart.tsx`:
- Side-by-side bar chart using Recharts BarChart
- Left bars: mix actual (mecanica, chapa, express)
- Right bars: mix ideal reference (40/30/30)
- Colors: brand blue, brand orange, brand green

**Step 6: Create alerta-brecha component**

Create `src/components/diagnostico/alerta-brecha.tsx`:
- Prominent card with brand-orange background
- Large number: "Te faltan X autos por dia"
- Subtext: "Eso representa $Y/mes en ingreso no capturado"
- Icon: AlertTriangle from Lucide

**Step 7: Create resumen-ejecutivo component**

Create `src/components/diagnostico/resumen-ejecutivo.tsx`:
- Button "Generar Resumen Ejecutivo"
- On click: POST to `/api/ia/resumen` with diagnostico data
- Shows generated text in a formatted card
- Copy-to-clipboard button

**Step 8: Create IA resumen API route**

Create `src/app/api/ia/resumen/route.ts`:
- POST: receive diagnostico data, call Claude API
- Prompt: generate executive summary for dealer meeting
- Return generated text

Create `src/lib/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function generarResumenEjecutivo(diagnostico: DiagnosticoResult, dealer: { nombre: string; marca: string; ciudad: string }) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Genera un resumen ejecutivo breve (3-4 parrafos) para presentar al gerente de posventa de ${dealer.nombre} (${dealer.marca}, ${dealer.ciudad}).

Datos del diagnostico:
- Capacidad instalada: ${diagnostico.capacidadInstalada} turnos/mes
- Turnos actuales: ${diagnostico.turnosActuales} turnos/mes
- Brecha: ${diagnostico.brecha} turnos sin cubrir
- Ingreso no capturado: $${diagnostico.ingresoNoCaptado}/mes
- Absorcion de costos fijos: ${diagnostico.absorcionActual.toFixed(1)}%
- Faltan ${diagnostico.autosFaltantesDia} autos/dia

Tono: profesional pero directo. En espanol argentino. Sin bullet points, solo prosa. Enfocate en el impacto economico y la oportunidad.`
    }],
  })
  return (message.content[0] as { text: string }).text
}
```

**Step 9: Assemble diagnostico page**

Create `src/app/(authenticated)/concesionarios/[id]/diagnostico/page.tsx`:
- Fetch concesionario and diagnostico data
- Layout: 2-column grid on desktop
  - Top left: Grilla de elevadores
  - Top right: Gauge de absorcion
  - Middle: Alerta de brecha (full width)
  - Bottom left: Mix chart
  - Bottom right: KPI cards (capacidad, turnos, ingreso actual, ingreso potencial)
- Resumen ejecutivo section at bottom

**Step 10: Verify diagnostico with seed data**

Use the seed concesionario (8 elevadores, 55% ocupacion).
Expected calculations:
- Capacidad: 8 × (10/1.5) × 22 = 1173 turnos/mes
- Turnos actuales: 1173 × 0.55 = 645
- Brecha: 528
- Ingreso no captado: 528 × 180000 = $95.040.000

**Step 11: Commit**

```bash
git add -A
git commit -m "feat: add diagnostico module with brecha calculation and visualizations"
```

---

## Task 9: Seed Data

**Files:**
- Modify: `prisma/seed.ts`

**Step 1: Extend seed with concesionario and 50 clientes**

Update `prisma/seed.ts` to add after the admin user:
- Concesionario "Automotores del Sur" (Toyota, Neuquen, 8 elevadores, 10hs, 22 dias, costo fijo $15.000.000, ticket $180.000, 55% ocupacion, mix 55/30/15)
- 50 clientes with varied data:
  - Mix of Toyota models (Corolla, Hilux, Yaris, SW4, Etios, Camry, RAV4)
  - Anios 2018-2025
  - KM from 5000 to 120000
  - Ultimo service spread across last 18 months (some recent, some overdue)
  - Patentes in Argentine format (AA 000 AA)
  - Telefonos in +54 format
  - Some with email, some without

**Step 2: Run seed**

Run: `npx prisma db seed`
Expected: 1 admin user, 1 concesionario, 50 clientes created.

**Step 3: Verify diagnostico page with real data**

Navigate to the diagnostico page for "Automotores del Sur".
Expected: All visualizations render with calculated data.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add seed data with example concesionario and 50 clientes"
```

---

## Task 10: Dashboard with Aggregated KPIs

**Files:**
- Modify: `src/app/(authenticated)/dashboard/page.tsx`

**Step 1: Build dashboard page**

Update dashboard to show:
- Total concesionarios card
- Brecha total agregada (sum of all brechas)
- Ingreso potencial no capturado total
- Campanas activas count
- List of concesionarios as cards with quick stats (ocupacion %, brecha, clientes)
- Each card links to the concesionario detail page

**Step 2: Verify dashboard renders with seed data**

Expected: Shows "Automotores del Sur" with its stats.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dashboard with aggregated KPIs"
```

---

## Execution Notes

- All pages under `(authenticated)` route group share the sidebar layout
- Use `'use client'` only in components that need interactivity (forms, charts, buttons with handlers)
- Server components for data fetching whenever possible
- Handle loading states with `loading.tsx` files in each route
- Handle errors with `error.tsx` files
- Use Next.js 15 async params pattern: `{ params }: { params: Promise<{ id: string }> }`
