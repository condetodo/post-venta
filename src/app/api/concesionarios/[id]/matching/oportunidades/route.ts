import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const estado = req.nextUrl.searchParams.get('estado')

  const where: Record<string, unknown> = { concesionarioId: id }
  if (estado) where.estado = estado

  const oportunidades = await prisma.oportunidad.findMany({
    where,
    include: {
      cliente: true,
      vehiculo: true,
    },
    orderBy: { scoreMatching: 'desc' },
  })

  return NextResponse.json(oportunidades)
}
