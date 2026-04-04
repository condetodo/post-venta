import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/claude'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
  })

  if (!concesionario) {
    return NextResponse.json(
      { error: 'Concesionario no encontrado' },
      { status: 404 }
    )
  }

  const oportunidades = await prisma.oportunidad.findMany({
    where: {
      concesionarioId: id,
      mensajeOferta: null,
    },
    include: {
      cliente: true,
      vehiculo: true,
    },
  })

  if (oportunidades.length === 0) {
    return NextResponse.json({ generados: 0 })
  }

  let generados = 0

  if (!process.env.ANTHROPIC_API_KEY) {
    for (const op of oportunidades) {
      const mensajeOferta = `Hola ${op.cliente.nombre}! De ${concesionario.nombre}, tenemos una oportunidad para vos. Tu ${op.cliente.modelo} ${op.cliente.anio} podria dar paso a un ${op.vehiculo.modelo} ${op.vehiculo.anio} ${op.vehiculo.tipo}. Precio: $${op.vehiculo.precio}. Escribinos para mas info!`

      await prisma.oportunidad.update({
        where: { id: op.id },
        data: { mensajeOferta },
      })

      generados++
    }
  } else {
    for (const op of oportunidades) {
      let mensajeOferta: string

      try {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Genera un mensaje de WhatsApp para una oferta comercial de un concesionario automotriz.

Concesionario: ${concesionario.nombre} (${concesionario.marca}, ${concesionario.ciudad})
Cliente: ${op.cliente.nombre}, tiene un ${op.cliente.marca} ${op.cliente.modelo} ${op.cliente.anio}
Vehiculo ofrecido: ${op.vehiculo.marca} ${op.vehiculo.modelo} ${op.vehiculo.version ?? ''} ${op.vehiculo.anio} (${op.vehiculo.tipo})
Precio: $${op.vehiculo.precio} ${op.vehiculo.moneda}
Score de matching: ${op.scoreMatching}

Requisitos:
- Tono cercano y profesional, en espanol argentino
- Mensaje corto, ideal para WhatsApp (maximo 350 caracteres)
- Personalizado para el cliente, mencionando su vehiculo actual y la oportunidad de upgrade
- Incluye un llamado a la accion claro
- No uses emojis excesivos, maximo 2

Devuelve SOLO el mensaje, sin explicaciones adicionales.`,
            },
          ],
        })

        const textBlock = message.content.find((b) => b.type === 'text')
        mensajeOferta = textBlock?.text ?? `Hola ${op.cliente.nombre}! De ${concesionario.nombre}, tenemos una oportunidad para vos. Tu ${op.cliente.modelo} ${op.cliente.anio} podria dar paso a un ${op.vehiculo.modelo} ${op.vehiculo.anio} ${op.vehiculo.tipo}. Precio: $${op.vehiculo.precio}. Escribinos para mas info!`
      } catch {
        mensajeOferta = `Hola ${op.cliente.nombre}! De ${concesionario.nombre}, tenemos una oportunidad para vos. Tu ${op.cliente.modelo} ${op.cliente.anio} podria dar paso a un ${op.vehiculo.modelo} ${op.vehiculo.anio} ${op.vehiculo.tipo}. Precio: $${op.vehiculo.precio}. Escribinos para mas info!`
      }

      await prisma.oportunidad.update({
        where: { id: op.id },
        data: { mensajeOferta },
      })

      generados++
    }
  }

  return NextResponse.json({ generados })
}
