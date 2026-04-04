import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface VehiculoImportData {
  marca?: string
  modelo?: string
  version?: string
  anio?: number | string
  tipo?: string
  precio?: number | string
  moneda?: string
  color?: string
  notas?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { vehiculos } = body as { vehiculos: VehiculoImportData[] }

  if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
    return NextResponse.json(
      { error: 'Se requiere un array de vehiculos' },
      { status: 400 }
    )
  }

  const errors: { row: number; message: string }[] = []
  const validVehiculos: {
    marca: string
    modelo: string
    version?: string
    anio: number
    tipo: string
    precio: number
    moneda: string
    color?: string
    notas?: string
    concesionarioId: string
  }[] = []

  for (let i = 0; i < vehiculos.length; i++) {
    const row = vehiculos[i]
    const rowNum = i + 1
    const rowErrors: string[] = []

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

    if (!row.tipo || !['0km', 'usado'].includes(row.tipo)) {
      rowErrors.push('tipo debe ser "0km" o "usado"')
    }

    const precio = Number(row.precio)
    if (row.precio == null || isNaN(precio) || precio <= 0) {
      rowErrors.push('precio debe ser un numero positivo')
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join(', ') })
      continue
    }

    validVehiculos.push({
      marca: String(row.marca).trim(),
      modelo: String(row.modelo).trim(),
      version: row.version ? String(row.version).trim() : undefined,
      anio,
      tipo: row.tipo!,
      precio,
      moneda: row.moneda ? String(row.moneda).trim() : 'ARS',
      color: row.color ? String(row.color).trim() : undefined,
      notas: row.notas ? String(row.notas).trim() : undefined,
      concesionarioId: id,
    })
  }

  let imported = 0
  if (validVehiculos.length > 0) {
    const result = await prisma.vehiculoStock.createMany({
      data: validVehiculos,
      skipDuplicates: true,
    })
    imported = result.count
  }

  const skipped = validVehiculos.length - imported

  return NextResponse.json({
    imported,
    skipped,
    errors,
  })
}
