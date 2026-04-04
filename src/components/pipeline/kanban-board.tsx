'use client'

import KanbanCard from './kanban-card'

interface Campana {
  id: string
  nombre: string
  tipo: string | null
  segmento: string | null
  estado: string
  clientesTarget: number
  clientesContactados: number
  turnosAgendados: number
}

interface KanbanBoardProps {
  campanas: Campana[]
  onSelect: (id: string) => void
}

const COLUMNS = [
  { key: 'borrador', label: 'Borrador', headerColor: 'bg-gray-500' },
  { key: 'activa', label: 'Activa', headerColor: 'bg-brand-green' },
  { key: 'pausada', label: 'Pausada', headerColor: 'bg-brand-orange' },
  { key: 'completada', label: 'Completada', headerColor: 'bg-brand-blue' },
] as const

export default function KanbanBoard({ campanas, onSelect }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = campanas.filter((c) => c.estado === col.key)
        return (
          <div key={col.key} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${col.headerColor}`}
              />
              <span className="text-sm font-semibold text-gray-700">
                {col.label}
              </span>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  Sin campanas
                </p>
              ) : (
                items.map((c) => (
                  <KanbanCard key={c.id} campana={c} onSelect={onSelect} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
