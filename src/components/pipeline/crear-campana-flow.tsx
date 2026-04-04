'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import SegmentoSelector from './segmento-selector'

interface CrearCampanaFlowProps {
  concesionarioId: string
  onCreated: (campanaId: string) => void
  onCancel: () => void
}

export default function CrearCampanaFlow({
  concesionarioId,
  onCreated,
  onCancel,
}: CrearCampanaFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedSegmento, setSelectedSegmento] = useState<{
    key: string
    nombre: string
    clienteIds: string[]
  } | null>(null)

  const now = new Date()
  const mesAnio = `${now.toLocaleString('es-AR', { month: 'long' })} ${now.getFullYear()}`
  const defaultNombre = selectedSegmento
    ? `${selectedSegmento.nombre} - ${mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1)}`
    : ''

  const [nombre, setNombre] = useState('')
  const [argumento, setArgumento] = useState('')
  const [campanaId, setCampanaId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [mensajesGenerados, setMensajesGenerados] = useState(false)

  const handleSegmentoSelect = (segmento: {
    key: string
    nombre: string
    clienteIds: string[]
  }) => {
    setSelectedSegmento(segmento)
    const mes = new Date().toLocaleString('es-AR', { month: 'long' })
    const anio = new Date().getFullYear()
    const label = `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`
    setNombre(`${segmento.nombre} - ${label}`)
  }

  const handleCrear = async () => {
    if (!selectedSegmento) return
    setCreating(true)

    try {
      const res = await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombre || defaultNombre,
            tipo: 'activacion',
            segmento: selectedSegmento.key,
            canal: 'whatsapp',
            clienteIds: selectedSegmento.clienteIds,
          }),
        }
      )
      const data = await res.json()
      setCampanaId(data.id)
      setStep(3)
    } catch {
      // handle error silently
    } finally {
      setCreating(false)
    }
  }

  const handleGenerarMensajes = async () => {
    if (!campanaId) return
    setGenerating(true)

    try {
      await fetch(
        `/api/concesionarios/${concesionarioId}/pipeline/campanas/${campanaId}/mensajes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ argumento }),
        }
      )
      setMensajesGenerados(true)
    } catch {
      // handle error silently
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Step indicators */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              step === s
                ? 'bg-brand-orange text-white'
                : step > s
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {s}
          </div>
        ))}
        <button
          onClick={onCancel}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>

      {/* Step 1: Segment selection */}
      {step === 1 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Selecciona un segmento
          </h3>
          <SegmentoSelector
            concesionarioId={concesionarioId}
            onSelect={handleSegmentoSelect}
          />
          {selectedSegmento && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Campaign details */}
      {step === 2 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Detalles de la campana
          </h3>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Argumento
            </label>
            <textarea
              value={argumento}
              onChange={(e) => setArgumento(e.target.value)}
              placeholder="Ej: Recordar service vencido, promo 20% off"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Atras
            </button>
            <button
              onClick={handleCrear}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Campana'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success + generate messages */}
      {step === 3 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-green" />
            <h3 className="text-lg font-semibold text-gray-900">
              Campana creada con {selectedSegmento?.clienteIds.length ?? 0}{' '}
              clientes
            </h3>
          </div>

          {!mensajesGenerados ? (
            <button
              onClick={handleGenerarMensajes}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar Mensajes con IA
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-brand-green font-medium">
                Mensajes generados
              </p>
              <button
                onClick={() => onCreated(campanaId!)}
                className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90"
              >
                Ver Campana
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
