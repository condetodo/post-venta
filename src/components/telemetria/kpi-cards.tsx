'use client'

import { DollarSign, Gauge, CalendarClock, ShoppingCart } from 'lucide-react'
import { formatARS, formatPercent, formatNumber } from '@/lib/format'

interface RegistroTelemetria {
  id: string
  fecha: string
  turnosDelDia: number
  elevadoresUsados: number
  ingresoDia: number
  mixMecanica: number
  mixChapa: number
  mixExpress: number
  oportunidadesVenta: number
  ventasCerradas: number
}

interface KpiCardsProps {
  registros: RegistroTelemetria[]
  elevadores: number
}

export function KpiCards({ registros, elevadores }: KpiCardsProps) {
  const ingresoTotal = registros.reduce((s, r) => s + r.ingresoDia, 0)

  const ocupacionPromedio =
    registros.length > 0
      ? registros.reduce((s, r) => s + (r.elevadoresUsados / elevadores) * 100, 0) /
        registros.length
      : null

  const totalTurnos = registros.reduce((s, r) => s + r.turnosDelDia, 0)

  const ventasCerradas = registros.reduce((s, r) => s + r.ventasCerradas, 0)

  const cards = [
    {
      label: 'Ingreso total',
      value: formatARS(ingresoTotal),
      icon: DollarSign,
    },
    {
      label: 'Ocupación promedio',
      value: ocupacionPromedio !== null ? formatPercent(ocupacionPromedio) : '—',
      icon: Gauge,
    },
    {
      label: 'Total turnos',
      value: formatNumber(totalTurnos),
      icon: CalendarClock,
    },
    {
      label: 'Ventas cerradas',
      value: ventasCerradas,
      icon: ShoppingCart,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
          <card.icon className="mb-2 h-5 w-5 text-brand-blue" />
          <p className="text-xs font-medium text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
