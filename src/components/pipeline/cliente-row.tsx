'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

interface ClienteRowProps {
  cc: {
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
  campanaId: string
  concesionarioId: string
  onUpdated: () => void
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-600',
  enviado: 'bg-brand-blue/10 text-brand-blue',
  respondio: 'bg-brand-orange/10 text-brand-orange',
  turno: 'bg-brand-green/10 text-brand-green',
  completado: 'bg-green-100 text-green-700',
}

const NEXT_ESTADO: Record<string, string> = {
  pendiente: 'enviado',
  enviado: 'respondio',
  respondio: 'turno',
  turno: 'completado',
}

const NEXT_LABEL: Record<string, string> = {
  pendiente: 'Enviado',
  enviado: 'Respondio',
  respondio: 'Turno',
  turno: 'Completado',
}

export default function ClienteRow({
  cc,
  campanaId,
  concesionarioId,
  onUpdated,
}: ClienteRowProps) {
  const [copied, setCopied] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const handleCopy = async () => {
    if (!cc.mensajeEnviado) return
    await navigator.clipboard.writeText(cc.mensajeEnviado)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAvanzar = async () => {
    const nextEstado = NEXT_ESTADO[cc.estado]
    if (!nextEstado) return
    setAdvancing(true)

    try {
      await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas/${campanaId}/clientes/${cc.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nextEstado }),
        }
      )
      onUpdated()
    } catch {
      // handle error silently
    } finally {
      setAdvancing(false)
    }
  }

  const estadoColor = ESTADO_COLORS[cc.estado] ?? 'bg-gray-100 text-gray-600'
  const isCompletado = cc.estado === 'completado'

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">
          {cc.cliente.nombre}
        </p>
        <p className="text-xs text-gray-500">
          {cc.cliente.modelo} {cc.cliente.anio}
        </p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor}`}
        >
          {cc.estado}
        </span>
      </td>
      <td className="px-4 py-3">
        {cc.mensajeEnviado && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-brand-green" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        {!isCompletado && (
          <button
            onClick={handleAvanzar}
            disabled={advancing}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue transition-colors hover:bg-brand-blue/20 disabled:opacity-50"
          >
            {advancing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              NEXT_LABEL[cc.estado] ?? 'Avanzar'
            )}
          </button>
        )}
      </td>
    </tr>
  )
}
