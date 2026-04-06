'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

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

interface ChartBrechaProps {
  registros: RegistroTelemetria[]
  capacidadDiaria: number
}

export default function ChartBrecha({
  registros,
  capacidadDiaria,
}: ChartBrechaProps) {
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
        Brecha: Turnos Reales vs Capacidad
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <ReferenceLine
            y={capacidadDiaria}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label="Capacidad"
          />
          <Bar
            dataKey="turnosDelDia"
            name="Turnos Reales"
            fill="#378ADD"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
