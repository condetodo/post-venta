import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
    include: { _count: { select: { clientes: true, campanas: true } } },
  })
  if (!concesionario)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(concesionario)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const concesionario = await prisma.concesionario.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(concesionario)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.concesionario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
