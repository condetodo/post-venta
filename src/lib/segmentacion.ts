export type SegmentoKey =
  | 'service_vencido'
  | 'km_alto'
  | 'garantia_prox'
  | 'renovacion'
  | 'express'

export interface SegmentoMeta {
  key: SegmentoKey
  nombre: string
  descripcion: string
  color: string
}

export const SEGMENTOS: SegmentoMeta[] = [
  {
    key: 'service_vencido',
    nombre: 'Service Vencido',
    descripcion: 'Mas de 6 meses sin service',
    color: 'brand-orange',
  },
  {
    key: 'km_alto',
    nombre: 'Km Alto',
    descripcion: 'Mas de 50.000 km',
    color: 'brand-blue',
  },
  {
    key: 'garantia_prox',
    nombre: 'Garantia Proxima',
    descripcion: 'Vehiculo cerca de cumplir 3 anios',
    color: 'brand-green',
  },
  {
    key: 'renovacion',
    nombre: 'Renovacion',
    descripcion: 'Vehiculo con mas de 4 anios',
    color: 'gray-500',
  },
  {
    key: 'express',
    nombre: 'Express',
    descripcion: 'Nunca visito el taller',
    color: 'red-500',
  },
]

interface ClienteInput {
  ultimoService: Date | string | null
  kmActual: number | null
  anio: number | null
  cantidadVisitas: number | null
}

export function clasificarCliente(cliente: ClienteInput): SegmentoKey[] {
  const segmentos: SegmentoKey[] = []
  const now = new Date()

  // service_vencido: >6 meses sin service
  if (!cliente.ultimoService) {
    segmentos.push('service_vencido')
  } else {
    const ultimo = new Date(cliente.ultimoService)
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    if (ultimo < sixMonthsAgo) {
      segmentos.push('service_vencido')
    }
  }

  // km_alto: >50000
  if (cliente.kmActual != null && cliente.kmActual > 50000) {
    segmentos.push('km_alto')
  }

  // garantia_prox: vehiculo dentro de 6 meses de cumplir 3 anios
  if (cliente.anio != null) {
    const aniosTres = cliente.anio + 3
    const fechaTresAnios = new Date(aniosTres, 0, 1)
    const seisAntes = new Date(fechaTresAnios)
    seisAntes.setMonth(seisAntes.getMonth() - 6)
    if (now >= seisAntes && now <= fechaTresAnios) {
      segmentos.push('garantia_prox')
    }
  }

  // renovacion: >4 anios
  if (cliente.anio != null && now.getFullYear() - cliente.anio >= 4) {
    segmentos.push('renovacion')
  }

  // express: nunca visito
  if (cliente.cantidadVisitas == null || cliente.cantidadVisitas === 0) {
    segmentos.push('express')
  }

  return segmentos
}
