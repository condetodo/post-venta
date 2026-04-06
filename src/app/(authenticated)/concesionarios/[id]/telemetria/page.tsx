'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RegistroForm from '@/components/telemetria/registro-form'
import { RegistrosTable } from '@/components/telemetria/registros-table'
import { KpiCards } from '@/components/telemetria/kpi-cards'
import ChartIngresos from '@/components/telemetria/chart-ingresos'
import ChartOcupacion from '@/components/telemetria/chart-ocupacion'
import ChartMix from '@/components/telemetria/chart-mix'
import ChartBrecha from '@/components/telemetria/chart-brecha'

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

interface Concesionario {
  id: string
  nombre: string
  elevadores: number
  horasOperativas: number
  diasOperativos: number
  ticketPromedio: number
}

export default function TelemetriaPage() {
  const params = useParams<{ id: string }>()
  const [tab, setTab] = useState<'cargar' | 'resultados'>('cargar')
  const [mes, setMes] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [registros, setRegistros] = useState<RegistroTelemetria[]>([])
  const [concesionario, setConcesionario] = useState<Concesionario | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingRegistro, setEditingRegistro] = useState<RegistroTelemetria | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/concesionarios/${params.id}/telemetria?mes=${mes}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setConcesionario(data.concesionario)
      setRegistros(data.registros)
    } catch {
      setConcesionario(null)
    } finally {
      setLoading(false)
    }
  }, [params.id, mes])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const HORAS_POR_TURNO = 1.5
  const capacidadDiaria = concesionario
    ? concesionario.elevadores * (concesionario.horasOperativas / HORAS_POR_TURNO)
    : 0
  const objetivoDiario = concesionario
    ? concesionario.ticketPromedio * capacidadDiaria
    : 0

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Cargando telemetria...
      </div>
    )
  }

  if (!concesionario) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No se pudo cargar la telemetria.</p>
        <Link
          href="/concesionarios"
          className="mt-2 inline-block text-sm text-brand-blue hover:underline"
        >
          Volver a concesionarios
        </Link>
      </div>
    )
  }

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
        Telemetria &mdash; {concesionario.nombre}
      </h1>

      {/* Controls row: month selector + tab bar */}
      <div className="mb-6 flex items-center justify-between">
        {/* Month selector */}
        <div>
          <input
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        {/* Tab bar */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setTab('cargar')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'cargar'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cargar
          </button>
          <button
            onClick={() => setTab('resultados')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'resultados'
                ? 'bg-white text-brand-orange shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resultados
          </button>
        </div>
      </div>

      {/* Tab: Cargar */}
      {tab === 'cargar' && (
        <div className="space-y-6">
          <RegistroForm
            concesionarioId={concesionario.id}
            maxElevadores={concesionario.elevadores}
            editingRegistro={editingRegistro}
            onSaved={() => {
              setEditingRegistro(null)
              fetchData()
            }}
            onCancelEdit={() => setEditingRegistro(null)}
          />
          <RegistrosTable
            registros={registros}
            onEdit={(r) => setEditingRegistro(r)}
            onDelete={async (registroId) => {
              await fetch(
                `/api/concesionarios/${concesionario.id}/telemetria/${registroId}`,
                { method: 'DELETE' }
              )
              fetchData()
            }}
          />
        </div>
      )}

      {/* Tab: Resultados */}
      {tab === 'resultados' && (
        <div className="space-y-6">
          <KpiCards registros={registros} elevadores={concesionario.elevadores} />
          <div className="grid gap-6 md:grid-cols-2">
            <ChartIngresos registros={registros} objetivoDiario={objetivoDiario} />
            <ChartOcupacion registros={registros} elevadores={concesionario.elevadores} />
            <ChartMix registros={registros} />
            <ChartBrecha registros={registros} capacidadDiaria={capacidadDiaria} />
          </div>
        </div>
      )}
    </div>
  )
}
