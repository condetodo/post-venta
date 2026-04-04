import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; oportunidadId: string }> }
) {
  const { id, oportunidadId } = await params
  const body = await req.json()

  const oportunidad = await prisma.oportunidad.findUnique({
    where: { id: oportunidadId },
  })

  if (!oportunidad || oportunidad.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Oportunidad no encontrada' },
      { status: 404 }
    )
  }

  const updated = await prisma.oportunidad.update({
    where: { id: oportunidadId },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.notas !== undefined && { notas: body.notas }),
    },
  })

  return NextResponse.json(updated)
}
