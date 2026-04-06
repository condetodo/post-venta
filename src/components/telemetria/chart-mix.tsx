'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

interface ChartMixProps {
  registros: RegistroTelemetria[]
}

export default function ChartMix({ registros }: ChartMixProps) {
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
        Mix de Servicios Diario
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar
            dataKey="mixMecanica"
            name="Mecanica"
            stackId="mix"
            fill="#378ADD"
          />
          <Bar
            dataKey="mixChapa"
            name="Chapa"
            stackId="mix"
            fill="#D85A30"
          />
          <Bar
            dataKey="mixExpress"
            name="Express"
            stackId="mix"
            fill="#1D9E75"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
