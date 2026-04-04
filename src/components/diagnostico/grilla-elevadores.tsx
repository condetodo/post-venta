'use client'

import { Car } from 'lucide-react'

interface GrillaElevadoresProps {
  elevadores: number
  ocupacion: number
}

export default function GrillaElevadores({
  elevadores,
  ocupacion,
}: GrillaElevadoresProps) {
  const ocupados = Math.round((elevadores * ocupacion) / 100)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Elevadores</h3>
      <p className="mb-4 text-xs text-gray-500">
        {ocupados}/{elevadores} ocupados
      </p>
      <div className="grid auto-rows-fr gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' }}>
        {Array.from({ length: elevadores }, (_, i) => {
          const isOcupado = i < ocupados
          return (
            <div
              key={i}
              className={`flex flex-col items-center justify-center rounded-lg p-3 transition-colors ${
                isOcupado
                  ? 'bg-gray-800 text-white'
                  : 'border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400'
              }`}
            >
              <Car className={`mb-1 h-5 w-5 ${isOcupado ? 'text-white' : 'text-gray-300'}`} />
              <span className={`text-xs font-medium ${isOcupado ? 'text-white' : 'text-gray-400'}`}>
                #{i + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
