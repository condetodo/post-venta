'use client'

import { useState, useEffect } from 'react'

interface RegistroTelemetria {
  id: string
  fecha: string
  turnosDelDia: number
  elevadoresUsados: number
  ingresoDia: number
  mixMecanica: number
  mixChapa: number
  mixExpress: number
  oportunidadesVenta: number
  ventasCerradas: number
}

interface RegistroFormProps {
  concesionarioId: string
  maxElevadores: number
  editingRegistro?: RegistroTelemetria | null
  onSaved: () => void
  onCancelEdit?: () => void
}

interface FormState {
  fecha: string
  turnosDelDia: number
  elevadoresUsados: number
  ingresoDia: number
  mixMecanica: number
  mixChapa: number
  mixExpress: number
  oportunidadesVenta: number
  ventasCerradas: number
}

function todayString(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function formatDateDDMM(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  return dateStr
}

const defaultForm: FormState = {
  fecha: todayString(),
  turnosDelDia: 1,
  elevadoresUsados: 1,
  ingresoDia: 0,
  mixMecanica: 40,
  mixChapa: 30,
  mixExpress: 30,
  oportunidadesVenta: 0,
  ventasCerradas: 0,
}

export default function RegistroForm({
  concesionarioId,
  maxElevadores,
  editingRegistro,
  onSaved,
  onCancelEdit,
}: RegistroFormProps) {
  const [form, setForm] = useState<FormState>({ ...defaultForm })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!editingRegistro

  useEffect(() => {
    if (editingRegistro) {
      const fechaFormatted = editingRegistro.fecha.includes('T')
        ? editingRegistro.fecha.slice(0, 10)
        : editingRegistro.fecha
      setForm({
        fecha: fechaFormatted,
        turnosDelDia: editingRegistro.turnosDelDia,
        elevadoresUsados: editingRegistro.elevadoresUsados,
        ingresoDia: editingRegistro.ingresoDia,
        mixMecanica: editingRegistro.mixMecanica,
        mixChapa: editingRegistro.mixChapa,
        mixExpress: editingRegistro.mixExpress,
        oportunidadesVenta: editingRegistro.oportunidadesVenta,
        ventasCerradas: editingRegistro.ventasCerradas,
      })
    } else {
      setForm({ ...defaultForm, fecha: todayString() })
    }
  }, [editingRegistro])

  const mixSum = form.mixMecanica + form.mixChapa + form.mixExpress
  const mixValid = Math.abs(mixSum - 100) < 0.01

  function update(field: keyof FormState, value: string | number) {
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
      ? `/api/concesionarios/${concesionarioId}/telemetria/${editingRegistro!.id}`
      : `/api/concesionarios/${concesionarioId}/telemetria`
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Ya existe un registro para esa fecha')
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar')
      }
      await res.json()
      setForm({ ...defaultForm, fecha: todayString() })
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        {isEdit
          ? `Editando registro del ${formatDateDDMM(form.fecha)}`
          : 'Registrar Dia'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Datos del Dia */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Datos del Dia
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => update('fecha', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Turnos del Dia</label>
              <input
                type="number"
                required
                min={1}
                value={form.turnosDelDia}
                onChange={(e) => update('turnosDelDia', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Elevadores Usados</label>
              <input
                type="number"
                required
                min={0}
                max={maxElevadores}
                value={form.elevadoresUsados}
                onChange={(e) => update('elevadoresUsados', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Ingreso y Ventas */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ingreso y Ventas
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Ingreso del Dia ($)</label>
              <input
                type="number"
                required
                min={0}
                value={form.ingresoDia}
                onChange={(e) => update('ingresoDia', parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Oportunidades de Venta</label>
              <input
                type="number"
                required
                min={0}
                value={form.oportunidadesVenta}
                onChange={(e) => update('oportunidadesVenta', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Ventas Cerradas</label>
              <input
                type="number"
                required
                min={0}
                value={form.ventasCerradas}
                onChange={(e) => update('ventasCerradas', parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Mix de Servicios */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Mix de Servicios
          </h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mecanica (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.mixMecanica}
                onChange={(e) => update('mixMecanica', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => update('mixChapa', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => update('mixExpress', parseFloat(e.target.value) || 0)}
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

        {/* Buttons */}
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
                : 'Registrar'}
          </button>
          {isEdit && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
