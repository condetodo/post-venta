interface ClienteForMatching {
  id: string
  nombre: string
  marca: string
  modelo: string
  anio: number
  kmActual: number | null
  cantidadVisitas: number
  ticketAcumulado: number
  segmentos: string[]
}

interface VehiculoForMatching {
  id: string
  marca: string
  modelo: string
  version: string | null
  anio: number
  tipo: string
  precio: number
}

export interface MatchResult {
  clienteId: string
  vehiculoId: string
  score: number
  reasons: string[]
}

export function calcularMatch(
  cliente: ClienteForMatching,
  vehiculo: VehiculoForMatching
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Upgrade vehicular (0-40 pts)
  const diffAnios = vehiculo.anio - cliente.anio
  if (diffAnios >= 2) {
    const pts = Math.min(40, diffAnios * 8)
    score += pts
    reasons.push(`Upgrade de ${diffAnios} anios (${cliente.anio} → ${vehiculo.anio})`)
  }

  // Lealtad de marca (0-25 pts)
  if (cliente.marca.toLowerCase() === vehiculo.marca.toLowerCase()) {
    score += 25
    reasons.push(`Misma marca: ${cliente.marca}`)
  }

  // Afinidad de precio (0-20 pts)
  if (cliente.cantidadVisitas > 0 && cliente.ticketAcumulado > 0) {
    const ticketPromedio = cliente.ticketAcumulado / cliente.cantidadVisitas
    if (ticketPromedio > 100000) {
      score += 20
      reasons.push('Cliente con alto ticket promedio')
    } else if (ticketPromedio > 50000) {
      score += 12
      reasons.push('Cliente con ticket promedio medio')
    } else {
      score += 5
    }
  }

  // Prioridad por segmento (0-15 pts)
  if (cliente.segmentos.includes('renovacion')) {
    score += 15
    reasons.push('Segmento: renovacion (vehiculo > 4 anios)')
  } else if (cliente.segmentos.includes('km_alto')) {
    score += 10
    reasons.push('Segmento: km alto (> 50.000 km)')
  } else if (cliente.segmentos.includes('garantia_prox')) {
    score += 5
    reasons.push('Segmento: garantia proxima a vencer')
  }

  return {
    clienteId: cliente.id,
    vehiculoId: vehiculo.id,
    score,
    reasons,
  }
}

export function generarMatches(
  clientes: ClienteForMatching[],
  vehiculos: VehiculoForMatching[],
  topN = 3,
  minScore = 20
): MatchResult[] {
  const results: MatchResult[] = []

  for (const cliente of clientes) {
    const matches = vehiculos
      .map((v) => calcularMatch(cliente, v))
      .filter((m) => m.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)

    results.push(...matches)
  }

  return results.sort((a, b) => b.score - a.score)
}
