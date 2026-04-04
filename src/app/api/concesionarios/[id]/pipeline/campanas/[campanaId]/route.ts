import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_TRANSITIONS: Record<string, string[]> = {
  borrador: ['activa'],
  activa: ['pausada', 'completada'],
  pausada: ['activa'],
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; campanaId: string }> }
) {
  const { id, campanaId } = await params

  const campana = await prisma.campana.findUnique({
    where: { id: campanaId },
    include: {
      campanaClientes: {
        include: { cliente: true },
      },
    },
  })

  if (!campana || campana.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Campana no encontrada' },
      { status: 404 }
    )
  }

  return NextResponse.json(campana)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; campanaId: string }> }
) {
  const { id, campanaId } = await params
  const body = await req.json()

  const campana = await prisma.campana.findUnique({
    where: { id: campanaId },
  })

  if (!campana || campana.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Campana no encontrada' },
      { status: 404 }
    )
  }

  if (body.estado && body.estado !== campana.estado) {
    const allowed = VALID_TRANSITIONS[campana.estado] ?? []
    if (!allowed.includes(body.estado)) {
      return NextResponse.json(
        {
          error: `Transicion de estado invalida: ${campana.estado} -> ${body.estado}`,
        },
        { status: 400 }
      )
    }
  }

  const updated = await prisma.campana.update({
    where: { id: campanaId },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.mensajeTemplate !== undefined && {
        mensajeTemplate: body.mensajeTemplate,
      }),
      ...(body.mensajeIA !== undefined && { mensajeIA: body.mensajeIA }),
      ...(body.argumento !== undefined && { argumento: body.argumento }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; campanaId: string }> }
) {
  const { id, campanaId } = await params

  const campana = await prisma.campana.findUnique({
    where: { id: campanaId },
  })

  if (!campana || campana.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Campana no encontrada' },
      { status: 404 }
    )
  }

  await prisma.campana.delete({ where: { id: campanaId } })

  return NextResponse.json({ ok: true })
}
