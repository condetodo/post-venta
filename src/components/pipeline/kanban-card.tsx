'use client'

interface CampanaCard {
  id: string
  nombre: string
  tipo: string | null
  segmento: string | null
  estado: string
  clientesTarget: number
  clientesContactados: number
  turnosAgendados: number
}

interface KanbanCardProps {
  campana: CampanaCard
  onSelect: (id: string) => void
}

const SEGMENTO_COLORS: Record<string, string> = {
  service_vencido: 'bg-brand-orange/10 text-brand-orange',
  km_alto: 'bg-brand-blue/10 text-brand-blue',
  garantia_prox: 'bg-brand-green/10 text-brand-green',
  renovacion: 'bg-gray-100 text-gray-600',
  express: 'bg-red-100 text-red-600',
}

export default function KanbanCard({ campana, onSelect }: KanbanCardProps) {
  const segmentoColor =
    SEGMENTO_COLORS[campana.segmento ?? ''] ?? 'bg-gray-100 text-gray-600'

  return (
    <div
      onClick={() => onSelect(campana.id)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <p className="font-semibold text-gray-900">{campana.nombre}</p>
      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${segmentoColor}`}
      >
        {(campana.segmento ?? '').replace(/_/g, ' ')}
      </span>
      <p className="mt-2 text-xs text-gray-500">
        {campana.clientesContactados}/{campana.clientesTarget} contactados
      </p>
      {campana.turnosAgendados > 0 && (
        <p className="text-xs text-gray-500">
          {campana.turnosAgendados} turnos agendados
        </p>
      )}
    </div>
  )
}
