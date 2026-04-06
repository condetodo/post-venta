'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatARS } from '@/lib/format'

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

interface ChartIngresosProps {
  registros: RegistroTelemetria[]
  objetivoDiario: number
}

export default function ChartIngresos({
  registros,
  objetivoDiario,
}: ChartIngresosProps) {
  const sorted = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  )
  const data = sorted.map((r) => ({
    dia: new Date(r.fecha).getDate().toString(),
    ...r,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Ingresos Diarios
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatARS(Number(value))} />
          <ReferenceLine
            y={objetivoDiario}
            stroke="#d1d5db"
            strokeDasharray="3 3"
            label="Objetivo"
          />
          <Line
            dataKey="ingresoDia"
            stroke="#378ADD"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
