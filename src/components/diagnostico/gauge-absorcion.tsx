'use client'

import { PieChart, Pie, Cell } from 'recharts'

interface GaugeAbsorcionProps {
  absorcionActual: number
  absorcionPotencial: number
}

export default function GaugeAbsorcion({
  absorcionActual,
  absorcionPotencial,
}: GaugeAbsorcionProps) {
  const displayMax = 200
  const fillValue = Math.min(absorcionActual, displayMax)
  const remaining = displayMax - fillValue

  const data = [
    { name: 'filled', value: fillValue },
    { name: 'remaining', value: remaining },
  ]

  let fillColor = '#ef4444' // red
  if (absorcionActual >= 100) {
    fillColor = '#1D9E75' // brand-green
  } else if (absorcionActual >= 80) {
    fillColor = '#f59e0b' // amber
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Absorcion de Costos Fijos
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative">
          <PieChart width={220} height={130}>
            <Pie
              data={data}
              cx={110}
              cy={110}
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={fillColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="text-3xl font-bold text-gray-900">
              {absorcionActual.toFixed(0)}%
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Actual: {absorcionActual.toFixed(1)}% | Potencial:{' '}
          {absorcionPotencial.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
