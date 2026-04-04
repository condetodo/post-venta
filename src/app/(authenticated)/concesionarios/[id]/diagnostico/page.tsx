'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Gauge,
  CalendarClock,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { formatARS, formatNumber } from '@/lib/format'
import type { DiagnosticoResult } from '@/lib/diagnostico'
import GrillaElevadores from '@/components/diagnostico/grilla-elevadores'
import GaugeAbsorcion from '@/components/diagnostico/gauge-absorcion'
import AlertaBrecha from '@/components/diagnostico/alerta-brecha'
import MixChart from '@/components/diagnostico/mix-chart'
import ResumenEjecutivo from '@/components/diagnostico/resumen-ejecutivo'

interface DiagnosticoData {
  concesionario: {
    id: string
    nombre: string
    marca: string
    ciudad: string
    elevadores: number
    ocupacionActual: number
    mixMecanica: number
    mixChapa: number
    mixExpress: number
  }
  diagnostico: DiagnosticoResult
}

const kpiCards = [
  {
    key: 'capacidadInstalada' as const,
    label: 'Capacidad Instalada',
    icon: Gauge,
    format: (v: number) => `${formatNumber(v)} turnos/mes`,
  },
  {
    key: 'turnosActuales' as const,
    label: 'Turnos Actuales',
    icon: CalendarClock,
    format: (v: number) => `${formatNumber(v)} turnos/mes`,
  },
  {
    key: 'ingresoActual' as const,
    label: 'Ingreso Actual',
    icon: DollarSign,
    format: (v: number) => `${formatARS(v)}/mes`,
  },
  {
    key: 'ingresoPotencial' as const,
    label: 'Ingreso Potencial',
    icon: TrendingUp,
    format: (v: number) => `${formatARS(v)}/mes`,
  },
]

export default function DiagnosticoPage() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<DiagnosticoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/concesionarios/${params.id}/diagnostico`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Cargando diagnostico...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No se pudo cargar el diagnostico.</p>
        <Link
          href="/concesionarios"
          className="mt-2 inline-block text-sm text-brand-blue hover:underline"
        >
          Volver a concesionarios
        </Link>
      </div>
    )
  }

  const { concesionario, diagnostico } = data

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/concesionarios/${concesionario.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {concesionario.nombre}
        </Link>
      </div>

      {/* Title */}
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Diagnostico &mdash; {concesionario.nombre}
      </h1>

      {/* Top row: Elevadores + Gauge */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <GrillaElevadores
          elevadores={concesionario.elevadores}
          ocupacion={concesionario.ocupacionActual}
        />
        <GaugeAbsorcion
          absorcionActual={diagnostico.absorcionActual}
          absorcionPotencial={diagnostico.absorcionPotencial}
        />
      </div>

      {/* Middle: Alerta brecha */}
      <div className="mb-6">
        <AlertaBrecha
          autosFaltantesDia={diagnostico.autosFaltantesDia}
          ingresoNoCaptado={diagnostico.ingresoNoCaptado}
        />
      </div>

      {/* Bottom row: Mix chart + KPI cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <MixChart
          mixMecanica={concesionario.mixMecanica}
          mixChapa={concesionario.mixChapa}
          mixExpress={concesionario.mixExpress}
        />
        <div className="grid grid-cols-2 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.key}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4"
            >
              <kpi.icon className="mb-2 h-5 w-5 text-brand-blue" />
              <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {kpi.format(diagnostico[kpi.key])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="mb-8">
        <ResumenEjecutivo
          diagnostico={diagnostico}
          dealer={{
            nombre: concesionario.nombre,
            marca: concesionario.marca,
            ciudad: concesionario.ciudad,
          }}
        />
      </div>
    </div>
  )
}
