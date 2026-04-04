import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ConcesionarioForm from '@/components/concesionario-form'

export default function NuevoConcesionarioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/concesionarios"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a concesionarios
        </Link>
      </div>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Nuevo Concesionario
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ConcesionarioForm />
      </div>
    </div>
  )
}
