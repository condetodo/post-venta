import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; registroId: string }> }
) {
  const { id, registroId } = await params
  const body = await req.json()

  const registro = await prisma.registroTelemetria.findUnique({
    where: { id: registroId },
  })

  if (!registro || registro.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Registro no encontrado' },
      { status: 404 }
    )
  }

  // Validate mix fields sum to 100 if all three are present
  if (
    body.mixMecanica !== undefined &&
    body.mixChapa !== undefined &&
    body.mixExpress !== undefined
  ) {
    const sum =
      Number(body.mixMecanica) + Number(body.mixChapa) + Number(body.mixExpress)
    if (Math.abs(sum - 100) > 0.1) {
      return NextResponse.json(
        { error: 'Los porcentajes de mix deben sumar 100' },
        { status: 400 }
      )
    }
  }

  const data: Record<string, unknown> = {}
  if (body.fecha !== undefined) data.fecha = new Date(body.fecha)
  if (body.turnosDelDia !== undefined) data.turnosDelDia = Number(body.turnosDelDia)
  if (body.elevadoresUsados !== undefined) data.elevadoresUsados = Number(body.elevadoresUsados)
  if (body.ingresoDia !== undefined) data.ingresoDia = Number(body.ingresoDia)
  if (body.mixMecanica !== undefined) data.mixMecanica = Number(body.mixMecanica)
  if (body.mixChapa !== undefined) data.mixChapa = Number(body.mixChapa)
  if (body.mixExpress !== undefined) data.mixExpress = Number(body.mixExpress)
  if (body.oportunidadesVenta !== undefined) data.oportunidadesVenta = Number(body.oportunidadesVenta)
  if (body.ventasCerradas !== undefined) data.ventasCerradas = Number(body.ventasCerradas)

  try {
    const updated = await prisma.registroTelemetria.update({
      where: { id: registroId },
      data,
    })

    return NextResponse.json(updated)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe un registro para esa fecha' },
        { status: 409 }
      )
    }
    throw err
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; registroId: string }> }
) {
  const { id, registroId } = await params

  const registro = await prisma.registroTelemetria.findUnique({
    where: { id: registroId },
  })

  if (!registro || registro.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Registro no encontrado' },
      { status: 404 }
    )
  }

  await prisma.registroTelemetria.delete({ where: { id: registroId } })

  return NextResponse.json({ ok: true })
}
