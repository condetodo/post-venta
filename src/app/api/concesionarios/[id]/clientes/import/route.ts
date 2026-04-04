import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ClienteImportData {
  nombre?: string
  telefono?: string
  email?: string
  marca?: string
  modelo?: string
  anio?: number | string
  patente?: string
  kmActual?: number | string
  ultimoService?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { clientes } = body as { clientes: ClienteImportData[] }

  if (!Array.isArray(clientes) || clientes.length === 0) {
    return NextResponse.json(
      { error: 'Se requiere un array de clientes' },
      { status: 400 }
    )
  }

  const errors: string[] = []
  const validClientes: {
    nombre: string
    telefono?: string
    email?: string
    marca: string
    modelo: string
    anio: number
    patente?: string
    kmActual?: number
    ultimoService?: Date
    concesionarioId: string
  }[] = []

  for (let i = 0; i < clientes.length; i++) {
    const row = clientes[i]
    const rowNum = i + 1
    const rowErrors: string[] = []

    if (!row.nombre || String(row.nombre).trim() === '') {
      rowErrors.push('nombre es requerido')
    }
    if (!row.marca || String(row.marca).trim() === '') {
      rowErrors.push('marca es requerida')
    }
    if (!row.modelo || String(row.modelo).trim() === '') {
      rowErrors.push('modelo es requerido')
    }

    const anio = Number(row.anio)
    if (!row.anio || isNaN(anio) || anio < 1900 || anio > 2100) {
      rowErrors.push('anio debe ser un numero valido')
    }

    if (rowErrors.length > 0) {
      errors.push(`Fila ${rowNum}: ${rowErrors.join(', ')}`)
      continue
    }

    const kmActual = row.kmActual ? Number(row.kmActual) : undefined
    let ultimoService: Date | undefined
    if (row.ultimoService) {
      const parsed = new Date(row.ultimoService)
      if (!isNaN(parsed.getTime())) {
        ultimoService = parsed
      }
    }

    validClientes.push({
      nombre: String(row.nombre).trim(),
      telefono: row.telefono ? String(row.telefono).trim() : undefined,
      email: row.email ? String(row.email).trim() : undefined,
      marca: String(row.marca).trim(),
      modelo: String(row.modelo).trim(),
      anio,
      patente: row.patente ? String(row.patente).trim() : undefined,
      kmActual: kmActual && !isNaN(kmActual) ? kmActual : undefined,
      ultimoService,
      concesionarioId: id,
    })
  }

  let imported = 0
  if (validClientes.length > 0) {
    const result = await prisma.cliente.createMany({
      data: validClientes,
      skipDuplicates: true,
    })
    imported = result.count
  }

  const skipped = validClientes.length - imported

  return NextResponse.json({
    imported,
    skipped,
    errors,
  })
}
