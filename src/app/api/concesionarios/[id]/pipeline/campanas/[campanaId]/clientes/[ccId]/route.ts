import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; campanaId: string; ccId: string }> }
) {
  const { id, campanaId, ccId } = await params
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

  const updated = await prisma.campanaCliente.update({
    where: { id: ccId },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.respuesta !== undefined && { respuesta: body.respuesta }),
      ...(body.montoGenerado !== undefined && {
        montoGenerado: body.montoGenerado,
      }),
    },
  })

  // Recompute campaign aggregates
  const allCc = await prisma.campanaCliente.findMany({
    where: { campanaId },
  })

  const clientesContactados = allCc.filter(
    (cc) => cc.estado !== 'pendiente'
  ).length
  const turnosAgendados = allCc.filter((cc) => cc.estado === 'turno').length
  const turnosCompletados = allCc.filter(
    (cc) => cc.estado === 'completado'
  ).length
  const ingresoGenerado = allCc.reduce((sum, cc) => sum + cc.montoGenerado, 0)

  await prisma.campana.update({
    where: { id: campanaId },
    data: {
      clientesContactados,
      turnosAgendados,
      turnosCompletados,
      ingresoGenerado,
    },
  })

  return NextResponse.json(updated)
}
