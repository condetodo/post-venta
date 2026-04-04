'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConcesionarioData {
  nombre: string
  ciudad: string
  marca: string
  elevadores: number
  horasOperativas: number
  diasOperativos: number
  costoFijoMensual: number
  ticketPromedio: number
  ocupacionActual: number
  mixMecanica: number
  mixChapa: number
  mixExpress: number
  notas: string
}

interface ConcesionarioFormProps {
  initialData?: Partial<ConcesionarioData>
  concesionarioId?: string
}

const defaultData: ConcesionarioData = {
  nombre: '',
  ciudad: '',
  marca: '',
  elevadores: 1,
  horasOperativas: 10,
  diasOperativos: 22,
  costoFijoMensual: 0,
  ticketPromedio: 0,
  ocupacionActual: 50,
  mixMecanica: 40,
  mixChapa: 30,
  mixExpress: 30,
  notas: '',
}

export default function ConcesionarioForm({
  initialData,
  concesionarioId,
}: ConcesionarioFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ConcesionarioData>({
    ...defaultData,
    ...initialData,
    notas: initialData?.notas ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!concesionarioId

  const mixSum = form.mixMecanica + form.mixChapa + form.mixExpress
  const mixValid = Math.abs(mixSum - 100) < 0.01

  function update(field: keyof ConcesionarioData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mixValid) {
      setError('El mix de servicios debe sumar 100%.')
      return
    }
    setLoading(true)
    setError(null)

    const url = isEdit
      ? `/api/concesionarios/${concesionarioId}`
      : '/api/concesionarios'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar')
      }
      await res.json()
      router.push(isEdit ? `/concesionarios/${concesionarioId}` : '/concesionarios')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Datos Generales */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Datos Generales
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              className={inputClass}
              placeholder="Nombre del concesionario"
            />
          </div>
          <div>
            <label className={labelClass}>Ciudad</label>
            <input
              type="text"
              required
              value={form.ciudad}
              onChange={(e) => update('ciudad', e.target.value)}
              className={inputClass}
              placeholder="Ciudad"
            />
          </div>
          <div>
            <label className={labelClass}>Marca</label>
            <input
              type="text"
              required
              value={form.marca}
              onChange={(e) => update('marca', e.target.value)}
              className={inputClass}
              placeholder="Ej: Toyota, Ford"
            />
          </div>
        </div>
      </section>

      {/* Capacidad del Taller */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Capacidad del Taller
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Elevadores</label>
            <input
              type="number"
              required
              min={1}
              value={form.elevadores}
              onChange={(e) => update('elevadores', parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Horas Operativas / dia</label>
            <input
              type="number"
              required
              min={1}
              max={24}
              value={form.horasOperativas}
              onChange={(e) => update('horasOperativas', parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dias Operativos / mes</label>
            <input
              type="number"
              required
              min={1}
              max={31}
              value={form.diasOperativos}
              onChange={(e) => update('diasOperativos', parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Financiero */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Financiero
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Costo Fijo Mensual ($)</label>
            <input
              type="number"
              min={0}
              value={form.costoFijoMensual}
              onChange={(e) =>
                update('costoFijoMensual', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Ticket Promedio ($)</label>
            <input
              type="number"
              min={0}
              value={form.ticketPromedio}
              onChange={(e) =>
                update('ticketPromedio', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Ocupacion y Mix */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Ocupacion y Mix
        </h3>
        <div className="mb-6">
          <label className={labelClass}>
            Ocupacion Actual: {form.ocupacionActual}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.ocupacionActual}
            onChange={(e) =>
              update('ocupacionActual', parseInt(e.target.value))
            }
            className="w-full accent-brand-orange"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <label className={labelClass}>Mix de Servicios (debe sumar 100%)</label>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mecanica (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.mixMecanica}
              onChange={(e) =>
                update('mixMecanica', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Chapa (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.mixChapa}
              onChange={(e) =>
                update('mixChapa', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Express (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.mixExpress}
              onChange={(e) =>
                update('mixExpress', parseFloat(e.target.value) || 0)
              }
              className={inputClass}
            />
          </div>
        </div>
        <p
          className={`mt-2 text-sm ${mixValid ? 'text-brand-green' : 'text-red-500'}`}
        >
          Total: {mixSum}%{' '}
          {mixValid ? '' : '- Debe sumar 100%'}
        </p>
      </section>

      {/* Notas */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Notas
        </h3>
        <textarea
          value={form.notas}
          onChange={(e) => update('notas', e.target.value)}
          rows={4}
          className={inputClass}
          placeholder="Notas adicionales..."
        />
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-orange px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-50"
        >
          {loading
            ? 'Guardando...'
            : isEdit
              ? 'Guardar Cambios'
              : 'Crear Concesionario'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
