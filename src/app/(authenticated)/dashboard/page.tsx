'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, AlertTriangle, DollarSign, Zap, Plus } from 'lucide-react'
import { calcularDiagnostico, type ConcesionarioInput } from '@/lib/diagnostico'
import { formatARS, formatPercent, formatNumber } from '@/lib/format'

interface Concesionario {
  id: string
  nombre: string
  ciudad: string
  marca: string
  elevadores: number
  horasOperativas: number
  diasOperativos: number
  costoFijoMensual: number
  ticketPromedio: number
  ocupacionActual: number
  _count: {
    clientes: number
    campanas: number
  }
}

export default function DashboardPage() {
  const [concesionarios, setConcesionarios] = useState<Concesionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/concesionarios')
      .then((res) => res.json())
      .then((data) => setConcesionarios(data))
      .catch(() => setConcesionarios([]))
      .finally(() => setLoading(false))
  }, [])

  const diagnosticos = concesionarios.map((c) => {
    const input: ConcesionarioInput = {
      elevadores: c.elevadores,
      horasOperativas: c.horasOperativas,
      diasOperativos: c.diasOperativos,
      costoFijoMensual: c.costoFijoMensual,
      ticketPromedio: c.ticketPromedio,
      ocupacionActual: c.ocupacionActual,
    }
    return { concesionario: c, diagnostico: calcularDiagnostico(input) }
  })

  const totalConcesionarios = concesionarios.length
  const brechaTotal = diagnosticos.reduce((sum, d) => sum + d.diagnostico.brecha, 0)
  const ingresoNoCaptadoTotal = diagnosticos.reduce(
    (sum, d) => sum + d.diagnostico.ingresoNoCaptado,
    0
  )
  const campanasActivas = 0

  function badgeColor(ocupacion: number): string {
    if (ocupacion >= 80) return 'bg-green-100 text-green-800'
    if (ocupacion >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Vista general de todos los concesionarios</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-blue/10 p-2">
              <Building2 className="h-5 w-5 text-brand-blue" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Concesionarios</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {formatNumber(totalConcesionarios)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-orange/10 p-2">
              <AlertTriangle className="h-5 w-5 text-brand-orange" />
            </div>
            <span className="text-sm font-medium text-gray-600">Brecha Total</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-brand-orange">
            {formatNumber(Math.round(brechaTotal))} turnos/mes
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-orange/10 p-2">
              <DollarSign className="h-5 w-5 text-brand-orange" />
            </div>
            <span className="text-sm font-medium text-gray-600">Ingreso No Capturado</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-brand-orange">
            {formatARS(ingresoNoCaptadoTotal)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-green/10 p-2">
              <Zap className="h-5 w-5 text-brand-green" />
            </div>
            <span className="text-sm font-medium text-gray-600">Campanas Activas</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {formatNumber(campanasActivas)}
          </p>
        </div>
      </div>

      {/* Concesionarios List */}
      {concesionarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            No hay concesionarios cargados.
          </p>
          <p className="mt-1 text-gray-600">
            <Link href="/concesionarios/nuevo" className="text-brand-blue hover:underline">
              Crea el primero.
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {diagnosticos.map(({ concesionario: c, diagnostico: d }) => (
            <Link
              key={c.id}
              href={`/concesionarios/${c.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-900">{c.nombre}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {c.ciudad} &middot; {c.marca}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor(c.ocupacionActual)}`}
                >
                  {formatPercent(c.ocupacionActual)} ocupacion
                </span>
                <span className="text-sm text-gray-600">
                  {formatNumber(c._count.clientes)} clientes
                </span>
                <span className="text-sm text-gray-600">
                  {formatNumber(Math.round(d.brecha))} turnos/mes brecha
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-brand-orange">
                {formatARS(d.ingresoNoCaptado)} ingreso no capturado
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
