'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

interface OportunidadRowProps {
  oportunidad: {
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
  concesionarioId: string
  onUpdated: () => void
}

const ESTADO_COLORS: Record<string, string> = {
  oportunidad: 'bg-gray-100 text-gray-600',
  contactado: 'bg-brand-blue/10 text-brand-blue',
  interesado: 'bg-brand-orange/10 text-brand-orange',
  venta: 'bg-brand-green/10 text-brand-green',
  perdida: 'bg-red-100 text-red-600',
}

const NEXT_ESTADO: Record<string, string> = {
  oportunidad: 'contactado',
  contactado: 'interesado',
  interesado: 'venta',
}

const NEXT_LABEL: Record<string, string> = {
  oportunidad: 'Contactado',
  contactado: 'Interesado',
  interesado: 'Venta',
}

export default function OportunidadRow({
  oportunidad,
  concesionarioId,
  onUpdated,
}: OportunidadRowProps) {
  const [copied, setCopied] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [losing, setLosing] = useState(false)

  const handleCopy = async () => {
    if (!oportunidad.mensajeOferta) return
    await navigator.clipboard.writeText(oportunidad.mensajeOferta)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateEstado = async (estado: string) => {
    const setter = estado === 'perdida' ? setLosing : setAdvancing
    setter(true)

    try {
      await fetch(
        `/api/concesionarios/${concesionarioId}/matching/oportunidades/${oportunidad.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado }),
        }
      )
      onUpdated()
    } catch {
      // handle error silently
    } finally {
      setter(false)
    }
  }

  const handleAvanzar = () => {
    const nextEstado = NEXT_ESTADO[oportunidad.estado]
    if (nextEstado) updateEstado(nextEstado)
  }

  const handlePerdida = () => {
    updateEstado('perdida')
  }

  const estadoColor = ESTADO_COLORS[oportunidad.estado] ?? 'bg-gray-100 text-gray-600'
  const isFinal = oportunidad.estado === 'venta' || oportunidad.estado === 'perdida'

  const scoreColor =
    oportunidad.scoreMatching > 60
      ? 'text-brand-green'
      : oportunidad.scoreMatching > 30
        ? 'text-brand-orange'
        : 'text-gray-400'

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">
          {oportunidad.cliente.nombre}
        </p>
        <p className="text-xs text-gray-500">
          su {oportunidad.cliente.modelo} {oportunidad.cliente.anio}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-900">
          {oportunidad.vehiculo.marca} {oportunidad.vehiculo.modelo}{' '}
          {oportunidad.vehiculo.version} {oportunidad.vehiculo.anio}
        </p>
        <span
          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            oportunidad.vehiculo.tipo === '0km'
              ? 'bg-brand-green/10 text-brand-green'
              : 'bg-brand-blue/10 text-brand-blue'
          }`}
        >
          {oportunidad.vehiculo.tipo}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-semibold ${scoreColor}`}>
          {oportunidad.scoreMatching}
        </span>
        <span className="text-xs text-gray-400">/100</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor}`}
        >
          {oportunidad.estado}
        </span>
      </td>
      <td className="px-4 py-3">
        {oportunidad.mensajeOferta && (
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
        <div className="flex items-center gap-2">
          {!isFinal && (
            <button
              onClick={handleAvanzar}
              disabled={advancing}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue transition-colors hover:bg-brand-blue/20 disabled:opacity-50"
            >
              {advancing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                NEXT_LABEL[oportunidad.estado] ?? 'Avanzar'
              )}
            </button>
          )}
          {!isFinal && (
            <button
              onClick={handlePerdida}
              disabled={losing}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {losing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Perdida'
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
