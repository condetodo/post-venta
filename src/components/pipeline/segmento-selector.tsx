'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface SegmentoCliente {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  modelo: string
  anio: number
}

interface Segmento {
  key: string
  nombre: string
  descripcion: string
  color: string
  count: number
  clientes: SegmentoCliente[]
}

interface SegmentoSelectorProps {
  concesionarioId: string
  onSelect: (segmento: {
    key: string
    nombre: string
    clienteIds: string[]
  }) => void
}

export default function SegmentoSelector({
  concesionarioId,
  onSelect,
}: SegmentoSelectorProps) {
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSegmentos() {
      try {
        const res = await fetch(
          `/api/concesionarios/${concesionarioId}/pipeline/segmentos`
        )
        const data = await res.json()
        setSegmentos(data.segmentos)
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchSegmentos()
  }, [concesionarioId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {segmentos.map((seg) => {
        const isSelected = selectedKey === seg.key
        return (
          <div
            key={seg.key}
            onClick={() => {
              setSelectedKey(seg.key)
              onSelect({
                key: seg.key,
                nombre: seg.nombre,
                clienteIds: seg.clientes.map((c) => c.id),
              })
            }}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              isSelected
                ? 'ring-2 ring-brand-blue border-brand-blue bg-brand-blue/5'
                : 'border-gray-200 bg-white hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{seg.nombre}</p>
              <span className="text-lg font-bold text-brand-blue">
                {seg.count}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{seg.descripcion}</p>
          </div>
        )
      })}
    </div>
  )
}
