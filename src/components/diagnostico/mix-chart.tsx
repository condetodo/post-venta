'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts'

interface MixChartProps {
  mixMecanica: number
  mixChapa: number
  mixExpress: number
}

export default function MixChart({
  mixMecanica,
  mixChapa,
  mixExpress,
}: MixChartProps) {
  const data = [
    { name: 'Mecanica', actual: mixMecanica, ideal: 40 },
    { name: 'Chapa', actual: mixChapa, ideal: 30 },
    { name: 'Express', actual: mixExpress, ideal: 30 },
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Mix de Trabajo: Actual vs Ideal
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="%" />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar dataKey="actual" name="Actual" fill="#378ADD" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="actual" position="top" fontSize={11} formatter={(v) => `${v}%`} />
          </Bar>
          <Bar dataKey="ideal" name="Ideal" fill="#d1d5db" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="ideal" position="top" fontSize={11} formatter={(v) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
