import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clasificarCliente, SEGMENTOS } from '@/lib/segmentacion'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const clientes = await prisma.cliente.findMany({
    where: { concesionarioId: id },
    orderBy: { nombre: 'asc' },
  })

  const segmentosMap: Record<
    string,
    {
      id: string
      nombre: string
      telefono: string | null
      email: string | null
      modelo: string
      anio: number
      kmActual: number | null
      ultimoService: Date | null
    }[]
  > = {}

  for (const seg of SEGMENTOS) {
    segmentosMap[seg.key] = []
  }

  for (const cliente of clientes) {
    const keys = clasificarCliente(cliente)
    for (const key of keys) {
      segmentosMap[key].push({
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        modelo: cliente.modelo,
        anio: cliente.anio,
        kmActual: cliente.kmActual,
        ultimoService: cliente.ultimoService,
      })
    }
  }

  const segmentos = SEGMENTOS.map((seg) => ({
    key: seg.key,
    nombre: seg.nombre,
    descripcion: seg.descripcion,
    color: seg.color,
    count: segmentosMap[seg.key].length,
    clientes: segmentosMap[seg.key],
  }))

  return NextResponse.json({
    segmentos,
    totalClientes: clientes.length,
  })
}
