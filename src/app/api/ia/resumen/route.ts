import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const { diagnostico, dealer } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      resumen:
        `Resumen ejecutivo para ${dealer.nombre} (${dealer.marca}, ${dealer.ciudad}):\n\n` +
        `El concesionario cuenta con una capacidad instalada de ${diagnostico.capacidadInstalada} turnos/mes, ` +
        `de los cuales actualmente se ocupan ${diagnostico.turnosActuales}. ` +
        `Esto deja una brecha de ${diagnostico.brecha} turnos sin cubrir, ` +
        `equivalente a ${diagnostico.autosFaltantesDia} autos por dia que no estan siendo atendidos.\n\n` +
        `El ingreso no capturado asciende a $${diagnostico.ingresoNoCaptado.toLocaleString('es-AR')}/mes, ` +
        `lo que representa una oportunidad significativa de crecimiento. ` +
        `La absorcion actual de costos fijos se ubica en ${diagnostico.absorcionActual.toFixed(1)}%, ` +
        `con un potencial de alcanzar ${diagnostico.absorcionPotencial.toFixed(1)}% si se logra cubrir la brecha.\n\n` +
        `(Este es un resumen de ejemplo. Configure la variable ANTHROPIC_API_KEY para generar resumenes con IA.)`,
    })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Genera un resumen ejecutivo breve (3-4 parrafos) para presentar al gerente de posventa de ${dealer.nombre} (${dealer.marca}, ${dealer.ciudad}).

Datos del diagnostico:
- Capacidad instalada: ${diagnostico.capacidadInstalada} turnos/mes
- Turnos actuales: ${diagnostico.turnosActuales} turnos/mes
- Brecha: ${diagnostico.brecha} turnos sin cubrir
- Ingreso no capturado: $${diagnostico.ingresoNoCaptado}/mes
- Absorcion de costos fijos: ${diagnostico.absorcionActual.toFixed(1)}%
- Faltan ${diagnostico.autosFaltantesDia} autos/dia

Tono: profesional pero directo. En espanol argentino. Sin bullet points, solo prosa. Enfocate en el impacto economico y la oportunidad.`,
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    return NextResponse.json({ resumen: textBlock?.text ?? '' })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: `Error al generar resumen: ${errorMessage}` },
      { status: 500 }
    )
  }
}
