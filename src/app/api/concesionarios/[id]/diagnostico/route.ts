import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularDiagnostico } from '@/lib/diagnostico'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
  })

  if (!concesionario) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const diagnostico = calcularDiagnostico({
    elevadores: concesionario.elevadores,
    horasOperativas: concesionario.horasOperativas,
    diasOperativos: concesionario.diasOperativos,
    costoFijoMensual: concesionario.costoFijoMensual,
    ticketPromedio: concesionario.ticketPromedio,
    ocupacionActual: concesionario.ocupacionActual,
  })

  return NextResponse.json({
    concesionario: {
      id: concesionario.id,
      nombre: concesionario.nombre,
      marca: concesionario.marca,
      ciudad: concesionario.ciudad,
      elevadores: concesionario.elevadores,
      ocupacionActual: concesionario.ocupacionActual,
      mixMecanica: concesionario.mixMecanica,
      mixChapa: concesionario.mixChapa,
      mixExpress: concesionario.mixExpress,
    },
    diagnostico,
  })
}
