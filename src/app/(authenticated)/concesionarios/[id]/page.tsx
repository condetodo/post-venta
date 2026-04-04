'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Activity,
  Zap,
  Car,
  BarChart3,
  MapPin,
} from 'lucide-react'

interface Concesionario {
  id: string
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
  notas: string | null
  _count: { clientes: number; campanas: number }
}

const submodules = [
  {
    label: 'Diagnostico',
    description: 'Calcular brecha y capacidad',
    icon: Activity,
    href: 'diagnostico',
    color: 'text-brand-orange bg-brand-orange/10',
  },
  {
    label: 'Pipeline',
    description: 'Generar demanda inteligente',
    icon: Zap,
    href: 'pipeline',
    color: 'text-brand-blue bg-brand-blue/10',
  },
  {
    label: 'Matching',
    description: 'Cruzar con stock comercial',
    icon: Car,
    href: 'matching',
    color: 'text-brand-green bg-brand-green/10',
  },
  {
    label: 'Telemetria',
    description: 'Ver resultados',
    icon: BarChart3,
    href: 'telemetria',
    color: 'text-purple-600 bg-purple-50',
  },
]

export default function ConcesionarioDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<Concesionario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/concesionarios/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleDelete() {
    if (!window.confirm('Estas seguro de eliminar este concesionario? Esta accion no se puede deshacer.'))
      return
    await fetch(`/api/concesionarios/${params.id}`, { method: 'DELETE' })
    router.push('/concesionarios')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">Cargando...</div>
    )
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Concesionario no encontrado.</p>
        <Link
          href="/concesionarios"
          className="mt-2 inline-block text-sm text-brand-blue hover:underline"
        >
          Volver a concesionarios
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/concesionarios"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Concesionarios
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.nombre}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {data.ciudad}
            </span>
            <span className="rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue">
              {data.marca}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/concesionarios/${data.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Elevadores</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data.elevadores}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Ocupacion</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data.ocupacionActual}%
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Clientes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data._count.clientes}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Campanas</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data._count.campanas}
          </p>
        </div>
      </div>

      {/* Submodule Navigation */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Modulos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {submodules.map((mod) => (
          <Link
            key={mod.href}
            href={`/concesionarios/${data.id}/${mod.href}`}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-orange/40"
          >
            <div className={`rounded-lg p-3 ${mod.color}`}>
              <mod.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-brand-orange">
                {mod.label}
              </p>
              <p className="text-sm text-gray-500">{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
