'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Building2, MapPin } from 'lucide-react'

interface Concesionario {
  id: string
  nombre: string
  ciudad: string
  marca: string
  ocupacionActual: number
  _count: { clientes: number; campanas: number }
}

function ocupacionColor(value: number) {
  if (value >= 85) return 'text-red-600 bg-red-50'
  if (value >= 60) return 'text-amber-600 bg-amber-50'
  return 'text-brand-green bg-emerald-50'
}

export default function ConcesionariosPage() {
  const [concesionarios, setConcesionarios] = useState<Concesionario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/concesionarios')
      .then((res) => res.json())
      .then((data) => setConcesionarios(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Concesionarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion de concesionarios y talleres
          </p>
        </div>
        <Link
          href="/concesionarios/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo Concesionario
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Cargando...
        </div>
      ) : concesionarios.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">
            No hay concesionarios cargados. Crea el primero.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {concesionarios.map((c) => (
            <Link
              key={c.id}
              href={`/concesionarios/${c.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-orange/40"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange">
                  {c.nombre}
                </h3>
                <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
                  {c.marca}
                </span>
              </div>

              <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {c.ciudad}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ocupacionColor(c.ocupacionActual)}`}
                >
                  {c.ocupacionActual}% ocupacion
                </span>
                <span className="text-xs text-gray-400">
                  {c._count.clientes} cliente{c._count.clientes !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
