'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface StockFormProps {
  concesionarioId: string
  onCreated: () => void
  onCancel: () => void
}

interface FormData {
  marca: string
  modelo: string
  version: string
  anio: number | ''
  tipo: '0km' | 'usado'
  precio: number | ''
  moneda: 'ARS' | 'USD'
  color: string
  notas: string
}

export default function StockForm({
  concesionarioId,
  onCreated,
  onCancel,
}: StockFormProps) {
  const [form, setForm] = useState<FormData>({
    marca: '',
    modelo: '',
    version: '',
    anio: '',
    tipo: '0km',
    precio: '',
    moneda: 'ARS',
    color: '',
    notas: '',
  })
  const [saving, setSaving] = useState(false)

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue'

  const canSubmit = form.marca && form.modelo && form.anio && form.tipo && form.precio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSaving(true)
    try {
      const res = await fetch(
        `/api/concesionarios/${concesionarioId}/matching/stock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            anio: Number(form.anio),
            precio: Number(form.precio),
          }),
        }
      )

      if (res.ok) {
        onCreated()
      }
    } catch {
      // handle error silently
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Agregar vehiculo al stock
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Ej: Toyota"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="Ej: Corolla"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Version
            </label>
            <input
              type="text"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              placeholder="Ej: XEI 2.0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Anio <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.anio}
              onChange={(e) =>
                setForm({ ...form, anio: e.target.value ? Number(e.target.value) : '' })
              }
              placeholder="Ej: 2024"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as '0km' | 'usado' })
              }
              className={inputClass}
              required
            >
              <option value="0km">0km</option>
              <option value="usado">Usado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.precio}
              onChange={(e) =>
                setForm({ ...form, precio: e.target.value ? Number(e.target.value) : '' })
              }
              placeholder="Ej: 35000000"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Moneda
            </label>
            <select
              value={form.moneda}
              onChange={(e) =>
                setForm({ ...form, moneda: e.target.value as 'ARS' | 'USD' })
              }
              className={inputClass}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Color
            </label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              placeholder="Ej: Blanco"
              className={inputClass}
            />
          </div>
          <div className="col-span-2 md:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Notas
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Observaciones adicionales..."
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-green/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar vehiculo'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
