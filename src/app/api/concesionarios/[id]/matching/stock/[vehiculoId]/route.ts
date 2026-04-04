import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vehiculoId: string }> }
) {
  const { id, vehiculoId } = await params
  const body = await req.json()

  const vehiculo = await prisma.vehiculoStock.findUnique({
    where: { id: vehiculoId },
  })

  if (!vehiculo || vehiculo.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Vehiculo no encontrado' },
      { status: 404 }
    )
  }

  const updated = await prisma.vehiculoStock.update({
    where: { id: vehiculoId },
    data: {
      ...(body.marca !== undefined && { marca: String(body.marca).trim() }),
      ...(body.modelo !== undefined && { modelo: String(body.modelo).trim() }),
      ...(body.version !== undefined && { version: body.version ? String(body.version).trim() : null }),
      ...(body.anio !== undefined && { anio: Number(body.anio) }),
      ...(body.tipo !== undefined && { tipo: body.tipo }),
      ...(body.precio !== undefined && { precio: Number(body.precio) }),
      ...(body.moneda !== undefined && { moneda: String(body.moneda).trim() }),
      ...(body.color !== undefined && { color: body.color ? String(body.color).trim() : null }),
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.notas !== undefined && { notas: body.notas ? String(body.notas).trim() : null }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; vehiculoId: string }> }
) {
  const { id, vehiculoId } = await params

  const vehiculo = await prisma.vehiculoStock.findUnique({
    where: { id: vehiculoId },
  })

  if (!vehiculo || vehiculo.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Vehiculo no encontrado' },
      { status: 404 }
    )
  }

  await prisma.vehiculoStock.delete({ where: { id: vehiculoId } })

  return NextResponse.json({ ok: true })
}
