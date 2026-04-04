import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const campanas = await prisma.campana.findMany({
    where: { concesionarioId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { campanaClientes: true },
      },
    },
  })

  return NextResponse.json({ campanas })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { nombre, tipo, segmento, canal, clienteIds } = await req.json()

  const campana = await prisma.campana.create({
    data: {
      nombre,
      tipo,
      segmento,
      canal,
      estado: 'borrador',
      clientesTarget: clienteIds.length,
      concesionarioId: id,
    },
  })

  if (clienteIds.length > 0) {
    await prisma.campanaCliente.createMany({
      data: clienteIds.map((clienteId: string) => ({
        campanaId: campana.id,
        clienteId,
        estado: 'pendiente',
      })),
    })
  }

  return NextResponse.json(campana, { status: 201 })
}
