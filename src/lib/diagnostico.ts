export interface DiagnosticoResult {
  capacidadInstalada: number
  turnosActuales: number
  brecha: number
  ingresoActual: number
  ingresoNoCaptado: number
  ingresoPotencial: number
  absorcionActual: number
  absorcionPotencial: number
  autosFaltantesDia: number
  turnosFaltantesDia: number
  ocupacionObjetivo: number
}

export interface ConcesionarioInput {
  elevadores: number
  horasOperativas: number
  diasOperativos: number
  costoFijoMensual: number
  ticketPromedio: number
  ocupacionActual: number
}

const HORAS_POR_TURNO = 1.5

export function calcularDiagnostico(input: ConcesionarioInput): DiagnosticoResult {
  const capacidadInstalada =
    input.elevadores * (input.horasOperativas / HORAS_POR_TURNO) * input.diasOperativos
  const turnosActuales = Math.round(capacidadInstalada * (input.ocupacionActual / 100))
  const brecha = capacidadInstalada - turnosActuales

  const ingresoActual = turnosActuales * input.ticketPromedio
  const ingresoNoCaptado = brecha * input.ticketPromedio
  const ingresoPotencial = ingresoActual + ingresoNoCaptado

  const absorcionActual =
    input.costoFijoMensual > 0
      ? (ingresoActual / input.costoFijoMensual) * 100
      : 0
  const absorcionPotencial =
    input.costoFijoMensual > 0
      ? (ingresoPotencial / input.costoFijoMensual) * 100
      : 0

  const autosFaltantesDia = Math.round(brecha / input.diasOperativos)
  const turnosFaltantesDia = brecha / input.diasOperativos

  return {
    capacidadInstalada,
    turnosActuales,
    brecha,
    ingresoActual,
    ingresoNoCaptado,
    ingresoPotencial,
    absorcionActual,
    absorcionPotencial,
    autosFaltantesDia,
    turnosFaltantesDia,
    ocupacionObjetivo: 85,
  }
}
