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
