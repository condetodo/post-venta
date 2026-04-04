'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Zap,
  Target,
  Plus,
  Upload,
  Trash2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { formatARS } from '@/lib/format'
import StockForm from '@/components/matching/stock-form'
import ImportStock from '@/components/matching/import-stock'
import OportunidadRow from '@/components/matching/oportunidad-row'

type View = 'stock' | 'matching' | 'oportunidades'

interface Concesionario {
  id: string
  nombre: string
}

interface Vehiculo {
  id: string
  marca: string
  modelo: string
  version: string | null
  anio: number
  tipo: string
  precio: number
  moneda: string
  color: string | null
  estado: string
}

interface Oportunidad {
  id: string
  estado: string
  scoreMatching: number
  mensajeOferta: string | null
  cliente: {
    nombre: string
    modelo: string
    anio: number
    kmActual: number | null
  }
  vehiculo: {
    marca: string
    modelo: string
    version: string | null
    anio: number
    tipo: string
    precio: number
  }
}

export default function MatchingPage() {
  const params = useParams<{ id: string }>()
  const [concesionario, setConcesionario] = useState<Concesionario | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('stock')

  // Stock state
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [stockTotal, setStockTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Matching state
  const [clientesElegibles, setClientesElegibles] = useState(0)
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState(0)
  const [runningMatching, setRunningMatching] = useState(false)
  const [matchingResult, setMatchingResult] = useState<number | null>(null)

  // Oportunidades state
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([])
  const [filterOportEstado, setFilterOportEstado] = useState('')
  const [generatingOfertas, setGeneratingOfertas] = useState(false)

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue'

  // Fetch concesionario
  useEffect(() => {
    fetch(`/api/concesionarios/${params.id}`)
      .then((r) => r.json())
      .then(setConcesionario)
      .catch(() => setConcesionario(null))
      .finally(() => setLoading(false))
  }, [params.id])

  // Fetch stock
  const fetchStock = useCallback(() => {
    const qs = new URLSearchParams()
    if (filterTipo) qs.set('tipo', filterTipo)
    if (filterEstado) qs.set('estado', filterEstado)
    qs.set('limit', '100')

    fetch(`/api/concesionarios/${params.id}/matching/stock?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setVehiculos(data.vehiculos ?? [])
        setStockTotal(data.total ?? 0)
      })
      .catch(() => setVehiculos([]))
  }, [params.id, filterTipo, filterEstado])

  useEffect(() => {
    if (view === 'stock') fetchStock()
  }, [view, fetchStock])

  // Fetch matching stats
  const fetchMatchingStats = useCallback(() => {
    // Fetch eligible clients from segmentos
    fetch(`/api/concesionarios/${params.id}/pipeline/segmentos`)
      .then((r) => r.json())
      .then((data) => {
        const segmentos = data.segmentos ?? []
        const count = segmentos
          .filter((s: { key: string }) => s.key === 'renovacion' || s.key === 'km_alto')
          .reduce((sum: number, s: { count: number }) => sum + (s.count || 0), 0)
        setClientesElegibles(count)
      })
      .catch(() => setClientesElegibles(0))

    // Fetch available vehicle count
    fetch(`/api/concesionarios/${params.id}/matching/stock?estado=disponible&limit=1`)
      .then((r) => r.json())
      .then((data) => setVehiculosDisponibles(data.total ?? 0))
      .catch(() => setVehiculosDisponibles(0))
  }, [params.id])

  useEffect(() => {
    if (view === 'matching') {
      fetchMatchingStats()
      setMatchingResult(null)
    }
  }, [view, fetchMatchingStats])

  // Fetch oportunidades
  const fetchOportunidades = useCallback(() => {
    const qs = new URLSearchParams()
    if (filterOportEstado) qs.set('estado', filterOportEstado)

    fetch(`/api/concesionarios/${params.id}/matching/oportunidades?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => setOportunidades(data.oportunidades ?? []))
      .catch(() => setOportunidades([]))
  }, [params.id, filterOportEstado])

  useEffect(() => {
    if (view === 'oportunidades') fetchOportunidades()
  }, [view, fetchOportunidades])

  // Actions
  const handleDelete = async (vehiculoId: string) => {
    setDeletingId(vehiculoId)
    try {
      await fetch(
        `/api/concesionarios/${params.id}/matching/stock/${vehiculoId}`,
        { method: 'DELETE' }
      )
      fetchStock()
    } catch {
      // handle error silently
    } finally {
      setDeletingId(null)
    }
  }

  const handleRunMatching = async () => {
    setRunningMatching(true)
    setMatchingResult(null)
    try {
      const res = await fetch(
        `/api/concesionarios/${params.id}/matching/run`,
        { method: 'POST' }
      )
      const data = await res.json()
      setMatchingResult(data.oportunidadesCreadas ?? 0)
    } catch {
      // handle error silently
    } finally {
      setRunningMatching(false)
    }
  }

  const handleGenerarOfertas = async () => {
    setGeneratingOfertas(true)
    try {
      await fetch(
        `/api/concesionarios/${params.id}/matching/ofertas`,
        { method: 'POST' }
      )
      fetchOportunidades()
    } catch {
      // handle error silently
    } finally {
      setGeneratingOfertas(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Cargando matching...
      </div>
    )
  }

  if (!concesionario) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No se pudo cargar el concesionario.</p>
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
    <div className="mx-auto max-w-6xl">
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

      {/* Title + tabs */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Matching Comercial
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('stock')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'stock'
                ? 'bg-brand-blue text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="h-4 w-4" />
            Stock
          </button>
          <button
            onClick={() => setView('matching')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'matching'
                ? 'bg-brand-orange text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Zap className="h-4 w-4" />
            Ejecutar Matching
          </button>
          <button
            onClick={() => setView('oportunidades')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'oportunidades'
                ? 'bg-brand-green text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Target className="h-4 w-4" />
            Oportunidades
          </button>
        </div>
      </div>

      {/* Stock view */}
      {view === 'stock' && (
        <div className="space-y-4">
          {/* Stats + actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{stockTotal}</span> vehiculos en stock
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  setShowImport(false)
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  showForm
                    ? 'bg-brand-green text-white'
                    : 'bg-brand-green text-white hover:bg-brand-green/90'
                }`}
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowImport(!showImport)
                  setShowForm(false)
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  showImport
                    ? 'bg-brand-blue text-white'
                    : 'bg-brand-blue text-white hover:bg-brand-blue/90'
                }`}
              >
                <Upload className="h-4 w-4" />
                Importar Excel
              </button>
            </div>
          </div>

          {/* Form / Import */}
          {showForm && (
            <StockForm
              concesionarioId={params.id}
              onCreated={() => {
                setShowForm(false)
                fetchStock()
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {showImport && (
            <ImportStock
              concesionarioId={params.id}
              onImportComplete={() => {
                fetchStock()
              }}
            />
          )}

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className={inputClass + ' !w-40'}
            >
              <option value="">Todos los tipos</option>
              <option value="0km">0km</option>
              <option value="usado">Usado</option>
            </select>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className={inputClass + ' !w-40'}
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Marca</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Modelo</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Version</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Anio</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Precio</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                      No hay vehiculos en el stock.
                    </td>
                  </tr>
                ) : (
                  vehiculos.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-gray-900">{v.marca}</td>
                      <td className="px-4 py-3 text-gray-900">{v.modelo}</td>
                      <td className="px-4 py-3 text-gray-500">{v.version || '-'}</td>
                      <td className="px-4 py-3 text-gray-900">{v.anio}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            v.tipo === '0km'
                              ? 'bg-brand-green/10 text-brand-green'
                              : 'bg-brand-blue/10 text-brand-blue'
                          }`}
                        >
                          {v.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {v.moneda === 'USD' ? `USD ${v.precio.toLocaleString()}` : formatARS(v.precio)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            v.estado === 'disponible'
                              ? 'bg-brand-green/10 text-brand-green'
                              : v.estado === 'reservado'
                                ? 'bg-brand-orange/10 text-brand-orange'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {v.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        >
                          {deletingId === v.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matching view */}
      {view === 'matching' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Motor de Matching
            </h3>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-2xl font-bold text-gray-900">{clientesElegibles}</p>
                <p className="text-sm text-gray-500">clientes elegibles</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-2xl font-bold text-gray-900">{vehiculosDisponibles}</p>
                <p className="text-sm text-gray-500">vehiculos disponibles</p>
              </div>
            </div>

            <button
              onClick={handleRunMatching}
              disabled={runningMatching}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {runningMatching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Ejecutando matching...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Ejecutar Matching
                </>
              )}
            </button>

            {matchingResult !== null && (
              <div className="mt-6 rounded-lg bg-brand-green/10 p-4">
                <p className="text-sm font-medium text-brand-green">
                  Se generaron {matchingResult} oportunidades
                </p>
                <button
                  onClick={() => setView('oportunidades')}
                  className="mt-2 text-sm font-medium text-brand-blue hover:underline"
                >
                  Ver oportunidades
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Oportunidades view */}
      {view === 'oportunidades' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{oportunidades.length}</span> oportunidades
            </p>
            <button
              onClick={handleGenerarOfertas}
              disabled={generatingOfertas}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
            >
              {generatingOfertas ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Ofertas IA
                </>
              )}
            </button>
          </div>

          {/* Filter */}
          <div>
            <select
              value={filterOportEstado}
              onChange={(e) => setFilterOportEstado(e.target.value)}
              className={inputClass + ' !w-48'}
            >
              <option value="">Todos los estados</option>
              <option value="oportunidad">Oportunidad</option>
              <option value="contactado">Contactado</option>
              <option value="interesado">Interesado</option>
              <option value="venta">Venta</option>
              <option value="perdida">Perdida</option>
            </select>
          </div>

          {/* Table */}
          {oportunidades.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-400">
                No hay oportunidades. Ejecuta el matching primero.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Vehiculo recomendado</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Score</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Oferta</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {oportunidades.map((op) => (
                    <OportunidadRow
                      key={op.id}
                      oportunidad={op}
                      concesionarioId={params.id}
                      onUpdated={fetchOportunidades}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
