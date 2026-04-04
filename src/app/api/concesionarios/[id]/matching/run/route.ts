import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clasificarCliente } from '@/lib/segmentacion'
import { generarMatches } from '@/lib/matching'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [clientes, vehiculos] = await Promise.all([
    prisma.cliente.findMany({
      where: { concesionarioId: id },
    }),
    prisma.vehiculoStock.findMany({
      where: { concesionarioId: id, estado: 'disponible' },
    }),
  ])

  if (clientes.length === 0) {
    return NextResponse.json(
      { error: 'No hay clientes para este concesionario' },
      { status: 400 }
    )
  }

  if (vehiculos.length === 0) {
    return NextResponse.json(
      { error: 'No hay vehiculos disponibles en stock' },
      { status: 400 }
    )
  }

  const clientesForMatching = clientes.map((c) => {
    const segmentos = clasificarCliente({
      ultimoService: c.ultimoService,
      kmActual: c.kmActual,
      anio: c.anio,
      cantidadVisitas: c.cantidadVisitas,
    })

    return {
      id: c.id,
      nombre: c.nombre,
      marca: c.marca,
      modelo: c.modelo,
      anio: c.anio,
      kmActual: c.kmActual,
      cantidadVisitas: c.cantidadVisitas,
      ticketAcumulado: c.ticketAcumulado,
      segmentos,
    }
  })

  const vehiculosForMatching = vehiculos.map((v) => ({
    id: v.id,
    marca: v.marca,
    modelo: v.modelo,
    version: v.version,
    anio: v.anio,
    tipo: v.tipo,
    precio: v.precio,
  }))

  const matches = generarMatches(clientesForMatching, vehiculosForMatching)

  const oportunidadesData = matches.map((m) => ({
    clienteId: m.clienteId,
    vehiculoId: m.vehiculoId,
    scoreMatching: m.score,
    concesionarioId: id,
  }))

  let oportunidades = 0
  if (oportunidadesData.length > 0) {
    const result = await prisma.oportunidad.createMany({
      data: oportunidadesData,
      skipDuplicates: true,
    })
    oportunidades = result.count
  }

  return NextResponse.json({
    oportunidades,
    totalMatches: matches.length,
  })
}
