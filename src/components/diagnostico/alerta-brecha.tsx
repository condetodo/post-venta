'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { formatARS } from '@/lib/format'

interface AlertaBrechaProps {
  autosFaltantesDia: number
  ingresoNoCaptado: number
}

export default function AlertaBrecha({
  autosFaltantesDia,
  ingresoNoCaptado,
}: AlertaBrechaProps) {
  if (autosFaltantesDia <= 0) {
    return (
      <div className="flex items-center gap-5 rounded-lg bg-brand-green p-6 text-white">
        <CheckCircle className="h-12 w-12 shrink-0" />
        <div>
          <p className="text-xl font-bold">
            Excelente: sin brecha de capacidad
          </p>
          <p className="mt-1 text-sm text-white/90">
            El taller esta operando a capacidad optima o por encima del objetivo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5 rounded-lg bg-brand-orange p-6 text-white">
      <AlertTriangle className="h-12 w-12 shrink-0" />
      <div>
        <p className="text-xl font-bold">
          Te faltan {autosFaltantesDia} autos por dia
        </p>
        <p className="mt-1 text-sm text-white/90">
          Eso representa {formatARS(ingresoNoCaptado)}/mes en ingreso no
          capturado
        </p>
      </div>
    </div>
  )
}
