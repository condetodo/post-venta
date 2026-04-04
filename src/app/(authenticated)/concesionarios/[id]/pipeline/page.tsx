'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, LayoutGrid } from 'lucide-react'
import KanbanBoard from '@/components/pipeline/kanban-board'
import CrearCampanaFlow from '@/components/pipeline/crear-campana-flow'
import CampanaDetalle from '@/components/pipeline/campana-detalle'

type View = 'kanban' | 'crear' | 'detalle'

interface Campana {
  id: string
  nombre: string
  tipo: string | null
  segmento: string | null
  canal: string | null
  estado: string
  clientesTarget: number
  clientesContactados: number
  turnosAgendados: number
  turnosCompletados: number
  ingresoGenerado: number
  _count: { campanaClientes: number }
}

interface Concesionario {
  id: string
  nombre: string
}

export default function PipelinePage() {
  const params = useParams<{ id: string }>()
  const [concesionario, setConcesionario] = useState<Concesionario | null>(null)
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('kanban')
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null)

  const fetchCampanas = useCallback(() => {
    fetch(`/api/concesionarios/${params.id}/pipeline/campanas`)
      .then((res) => res.json())
      .then((data) => setCampanas(data.campanas ?? []))
      .catch(() => setCampanas([]))
  }, [params.id])

  useEffect(() => {
    Promise.all([
      fetch(`/api/concesionarios/${params.id}`)
        .then((r) => r.json())
        .then(setConcesionario),
      fetch(`/api/concesionarios/${params.id}/pipeline/campanas`)
        .then((r) => r.json())
        .then((data) => setCampanas(data.campanas ?? [])),
    ]).finally(() => setLoading(false))
  }, [params.id])

  function handleSelectCampana(id: string) {
    setSelectedCampanaId(id)
    setView('detalle')
  }

  function handleCreated(campanaId: string) {
    fetchCampanas()
    setSelectedCampanaId(campanaId)
    setView('detalle')
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Cargando pipeline...
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
          Pipeline de Activacion
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('kanban')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-brand-blue text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Campanas
          </button>
          <button
            onClick={() => setView('crear')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'crear'
                ? 'bg-brand-orange text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-4 w-4" />
            Nueva Campana
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' && (
        <KanbanBoard campanas={campanas} onSelect={handleSelectCampana} />
      )}

      {view === 'crear' && (
        <CrearCampanaFlow
          concesionarioId={params.id}
          onCreated={handleCreated}
          onCancel={() => setView('kanban')}
        />
      )}

      {view === 'detalle' && selectedCampanaId && (
        <CampanaDetalle
          campanaId={selectedCampanaId}
          concesionarioId={params.id}
          onBack={() => {
            fetchCampanas()
            setView('kanban')
          }}
          onRefresh={fetchCampanas}
        />
      )}
    </div>
  )
}
