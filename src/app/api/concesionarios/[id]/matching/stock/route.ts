import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams

  const page = Math.max(1, Number(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '20')))
  const tipo = searchParams.get('tipo')
  const estado = searchParams.get('estado')

  const where: Record<string, unknown> = { concesionarioId: id }
  if (tipo) where.tipo = tipo
  if (estado) where.estado = estado

  const [vehiculos, total] = await Promise.all([
    prisma.vehiculoStock.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehiculoStock.count({ where }),
  ])

  return NextResponse.json({
    vehiculos,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { marca, modelo, version, anio, tipo, precio, moneda, color, notas } = body

  const errors: string[] = []
  if (!marca || String(marca).trim() === '') errors.push('marca es requerida')
  if (!modelo || String(modelo).trim() === '') errors.push('modelo es requerido')
  if (!anio || isNaN(Number(anio)) || Number(anio) < 1900 || Number(anio) > 2100) errors.push('anio debe ser un numero valido')
  if (!tipo || !['0km', 'usado'].includes(tipo)) errors.push('tipo debe ser "0km" o "usado"')
  if (precio == null || isNaN(Number(precio)) || Number(precio) <= 0) errors.push('precio debe ser un numero positivo')

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
  }

  const vehiculo = await prisma.vehiculoStock.create({
    data: {
      marca: String(marca).trim(),
      modelo: String(modelo).trim(),
      version: version ? String(version).trim() : undefined,
      anio: Number(anio),
      tipo,
      precio: Number(precio),
      moneda: moneda ? String(moneda).trim() : 'ARS',
      color: color ? String(color).trim() : undefined,
      notas: notas ? String(notas).trim() : undefined,
      concesionarioId: id,
    },
  })

  return NextResponse.json(vehiculo, { status: 201 })
}
