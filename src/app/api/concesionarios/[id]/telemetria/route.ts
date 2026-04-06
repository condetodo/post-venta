import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams

  const mes = searchParams.get('mes')
  let startDate: Date
  let endDate: Date

  if (mes) {
    const [year, month] = mes.split('-').map(Number)
    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Formato de mes invalido. Use YYYY-MM' },
        { status: 400 }
      )
    }
    startDate = new Date(year, month - 1, 1)
    endDate = new Date(year, month, 1)
  } else {
    const now = new Date()
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      elevadores: true,
      horasOperativas: true,
      diasOperativos: true,
      ticketPromedio: true,
    },
  })

  if (!concesionario) {
    return NextResponse.json(
      { error: 'Concesionario no encontrado' },
      { status: 404 }
    )
  }

  const registros = await prisma.registroTelemetria.findMany({
    where: {
      concesionarioId: id,
      fecha: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: { fecha: 'desc' },
  })

  return NextResponse.json({ concesionario, registros })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const {
    fecha,
    turnosDelDia,
    elevadoresUsados,
    ingresoDia,
    mixMecanica,
    mixChapa,
    mixExpress,
    oportunidadesVenta,
    ventasCerradas,
  } = body

  const errors: string[] = []

  if (!fecha) errors.push('fecha es requerida')
  if (turnosDelDia == null || Number(turnosDelDia) < 0)
    errors.push('turnosDelDia debe ser >= 0')
  if (elevadoresUsados == null || Number(elevadoresUsados) < 0)
    errors.push('elevadoresUsados debe ser >= 0')
  if (ingresoDia == null || Number(ingresoDia) < 0)
    errors.push('ingresoDia debe ser >= 0')

  const mixSum =
    Number(mixMecanica || 0) +
    Number(mixChapa || 0) +
    Number(mixExpress || 0)
  if (Math.abs(mixSum - 100) > 0.1) {
    errors.push('mixMecanica + mixChapa + mixExpress debe sumar 100')
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
  }

  try {
    const registro = await prisma.registroTelemetria.create({
      data: {
        fecha: new Date(fecha),
        turnosDelDia: Number(turnosDelDia),
        elevadoresUsados: Number(elevadoresUsados),
        ingresoDia: Number(ingresoDia),
        mixMecanica: Number(mixMecanica),
        mixChapa: Number(mixChapa),
        mixExpress: Number(mixExpress),
        oportunidadesVenta: Number(oportunidadesVenta || 0),
        ventasCerradas: Number(ventasCerradas || 0),
        concesionarioId: id,
      },
    })

    return NextResponse.json(registro, { status: 201 })
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
