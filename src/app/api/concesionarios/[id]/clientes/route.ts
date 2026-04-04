import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)))
  const skip = (page - 1) * limit

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: { concesionarioId: id },
      orderBy: { nombre: 'asc' },
      skip,
      take: limit,
    }),
    prisma.cliente.count({ where: { concesionarioId: id } }),
  ])

  return NextResponse.json({
    clientes,
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

  const cliente = await prisma.cliente.create({
    data: {
      ...body,
      concesionarioId: id,
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}
