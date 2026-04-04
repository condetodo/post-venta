import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/claude'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; campanaId: string }> }
) {
  const { id, campanaId } = await params
  const { argumento, variantes } = await req.json()

  const campana = await prisma.campana.findUnique({
    where: { id: campanaId },
    include: {
      campanaClientes: {
        include: { cliente: true },
      },
    },
  })

  if (!campana || campana.concesionarioId !== id) {
    return NextResponse.json(
      { error: 'Campana no encontrada' },
      { status: 404 }
    )
  }

  const concesionario = await prisma.concesionario.findUnique({
    where: { id },
  })

  if (!concesionario) {
    return NextResponse.json(
      { error: 'Concesionario no encontrado' },
      { status: 404 }
    )
  }

  let template: string

  if (!process.env.ANTHROPIC_API_KEY) {
    template = `Hola {nombre}! De ${concesionario.nombre}, te contactamos por tu {modelo}. ${argumento}. Responde para agendar. Saludos!`
  } else {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Genera un mensaje de WhatsApp para una campana de posventa automotriz.

Concesionario: ${concesionario.nombre} (${concesionario.marca}, ${concesionario.ciudad})
Campana: ${campana.nombre} (tipo: ${campana.tipo}, segmento: ${campana.segmento})
Argumento principal: ${argumento}
${variantes ? `Variantes solicitadas: ${variantes}` : ''}

Requisitos:
- Tono cercano y profesional, en espanol argentino
- Mensaje corto, ideal para WhatsApp (maximo 300 caracteres)
- Usa estos placeholders exactos donde corresponda: {nombre}, {modelo}, {marca}, {anio}
- Incluye un llamado a la accion claro
- No uses emojis excesivos, maximo 2

Devuelve SOLO el template del mensaje, sin explicaciones adicionales.`,
          },
        ],
      })

      const textBlock = message.content.find((b) => b.type === 'text')
      template = textBlock?.text ?? `Hola {nombre}! De ${concesionario.nombre}, te contactamos por tu {modelo}. ${argumento}. Responde para agendar. Saludos!`
    } catch {
      template = `Hola {nombre}! De ${concesionario.nombre}, te contactamos por tu {modelo}. ${argumento}. Responde para agendar. Saludos!`
    }
  }

  // Store template in campana
  await prisma.campana.update({
    where: { id: campanaId },
    data: {
      mensajeIA: template,
      argumento,
    },
  })

  // Personalize for each CampanaCliente
  let personalizados = 0

  for (const cc of campana.campanaClientes) {
    const cliente = cc.cliente
    const mensajeEnviado = template
      .replace(/\{nombre\}/g, cliente.nombre)
      .replace(/\{modelo\}/g, cliente.modelo)
      .replace(/\{marca\}/g, cliente.marca)
      .replace(/\{anio\}/g, String(cliente.anio))

    await prisma.campanaCliente.update({
      where: { id: cc.id },
      data: { mensajeEnviado },
    })

    personalizados++
  }

  return NextResponse.json({ template, personalizados })
}
