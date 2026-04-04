'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { formatARS } from '@/lib/format'
import ClienteRow from './cliente-row'

interface CampanaCliente {
  id: string
  estado: string
  mensajeEnviado: string | null
  cliente: {
    nombre: string
    modelo: string
    anio: number
    telefono: string | null
  }
}

interface CampanaData {
  id: string
  nombre: string
  estado: string
  tipo: string
  segmento: string
  canal: string
  mensajeIA: string | null
  argumento: string | null
  clientesTarget: number
  clientesContactados: number
  turnosAgendados: number
  ingresoGenerado: number
  campanaClientes: CampanaCliente[]
}

interface CampanaDetalleProps {
  campanaId: string
  concesionarioId: string
  onBack: () => void
  onRefresh: () => void
}

const ESTADO_BADGE: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  activa: 'bg-brand-green/10 text-brand-green',
  pausada: 'bg-brand-orange/10 text-brand-orange',
  completada: 'bg-brand-blue/10 text-brand-blue',
}

export default function CampanaDetalle({
  campanaId,
  concesionarioId,
  onBack,
  onRefresh,
}: CampanaDetalleProps) {
  const [campana, setCampana] = useState<CampanaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingEstado, setUpdatingEstado] = useState(false)
  const [generatingMensajes, setGeneratingMensajes] = useState(false)

  const fetchCampana = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas/${campanaId}`
      )
      const data = await res.json()
      setCampana(data)
    } catch {
      // handle error silently
    } finally {
      setLoading(false)
    }
  }, [concesionarioId, campanaId])

  useEffect(() => {
    fetchCampana()
  }, [fetchCampana])

  const handleEstadoChange = async (nuevoEstado: string) => {
    setUpdatingEstado(true)
    try {
      await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas/${campanaId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      )
      await fetchCampana()
      onRefresh()
    } catch {
      // handle error silently
    } finally {
      setUpdatingEstado(false)
    }
  }

  const handleGenerarMensajes = async () => {
    setGeneratingMensajes(true)
    try {
      await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas/${campanaId}/mensajes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ argumento: campana?.argumento ?? '' }),
        }
      )
      await fetchCampana()
    } catch {
      // handle error silently
    } finally {
      setGeneratingMensajes(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (!campana) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Campana no encontrada</p>
      </div>
    )
  }

  const estadoBadge =
    ESTADO_BADGE[campana.estado] ?? 'bg-gray-100 text-gray-600'

  const stats = [
    { label: 'Target', value: campana.clientesTarget },
    { label: 'Contactados', value: campana.clientesContactados },
    { label: 'Turnos', value: campana.turnosAgendados },
    { label: 'Ingreso', value: formatARS(campana.ingresoGenerado) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{campana.nombre}</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoBadge}`}
        >
          {campana.estado}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {campana.estado === 'borrador' && (
          <button
            onClick={() => handleEstadoChange('activa')}
            disabled={updatingEstado}
            className="rounded-lg bg-brand-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:opacity-50"
          >
            Activar
          </button>
        )}
        {campana.estado === 'activa' && (
          <>
            <button
              onClick={() => handleEstadoChange('pausada')}
              disabled={updatingEstado}
              className="rounded-lg bg-brand-orange px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-50"
            >
              Pausar
            </button>
            <button
              onClick={() => handleEstadoChange('completada')}
              disabled={updatingEstado}
              className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
            >
              Completar
            </button>
          </>
        )}
        {campana.estado === 'pausada' && (
          <button
            onClick={() => handleEstadoChange('activa')}
            disabled={updatingEstado}
            className="rounded-lg bg-brand-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:opacity-50"
          >
            Reactivar
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Generate messages button */}
      {!campana.mensajeIA && (
        <button
          onClick={handleGenerarMensajes}
          disabled={generatingMensajes}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
        >
          {generatingMensajes ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generar Mensajes IA
            </>
          )}
        </button>
      )}

      {/* Message template preview */}
      {campana.mensajeIA && (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-xs font-medium text-gray-500">
            Template de mensaje IA
          </p>
          <p className="whitespace-pre-line text-sm text-gray-700">
            {campana.mensajeIA}
          </p>
        </div>
      )}

      {/* Client table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">
                  Nombre
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">
                  Mensaje
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {campana.campanaClientes.map((cc) => (
                <ClienteRow
                  key={cc.id}
                  cc={cc}
                  campanaId={campanaId}
                  concesionarioId={concesionarioId}
                  onUpdated={fetchCampana}
                />
              ))}
            </tbody>
          </table>
          {campana.campanaClientes.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Sin clientes en esta campana
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
