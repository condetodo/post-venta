'use client'

import {
  AreaChart,
  Area,
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

interface ChartOcupacionProps {
  registros: RegistroTelemetria[]
  elevadores: number
}

export default function ChartOcupacion({
  registros,
  elevadores,
}: ChartOcupacionProps) {
  const sorted = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  )
  const data = sorted.map((r) => ({
    dia: new Date(r.fecha).getDate().toString(),
    ocupacion: Math.round((r.elevadoresUsados / elevadores) * 100),
    ...r,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Ocupacion Diaria (%)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <ReferenceLine
            y={85}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label="Obj 85%"
          />
          <Area
            dataKey="ocupacion"
            stroke="#1D9E75"
            fill="#1D9E75"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
