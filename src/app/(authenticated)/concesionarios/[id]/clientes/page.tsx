'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSpreadsheet, Users } from 'lucide-react'
import ImportClientes from '@/components/import-clientes'

interface Cliente {
  id: string
  nombre: string
  modelo: string
  anio: number
  patente: string | null
  segmento: string | null
  estado: string
}

interface ClientesResponse {
  clientes: Cliente[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ClientesPage() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<ClientesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [page, setPage] = useState(1)

  const fetchClientes = useCallback(() => {
    setLoading(true)
    fetch(`/api/concesionarios/${params.id}/clientes?page=${page}&limit=50`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params.id, page])

  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  const handleImportComplete = useCallback(() => {
    fetchClientes()
  }, [fetchClientes])

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/concesionarios/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al concesionario
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-brand-blue" />
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          {data && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {data.total}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowImport((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {showImport ? 'Cerrar importacion' : 'Importar Excel'}
        </button>
      </div>

      {/* Import section */}
      {showImport && (
        <div className="mb-6">
          <ImportClientes
            concesionarioId={params.id}
            onImportComplete={handleImportComplete}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-sm text-gray-400">Cargando...</div>
      )}

      {/* Empty state */}
      {!loading && data && data.clientes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">
            No hay clientes cargados
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Importa un archivo Excel o CSV con tu base de clientes para comenzar a
            gestionar campanas y seguimiento.
          </p>
          {!showImport && (
            <button
              onClick={() => setShowImport(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importar Excel
            </button>
          )}
        </div>
      )}

      {/* Clientes table */}
      {!loading && data && data.clientes.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Modelo</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Anio</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Patente</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Segmento</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {c.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.modelo}</td>
                    <td className="px-4 py-3 text-gray-600">{c.anio}</td>
                    <td className="px-4 py-3 text-gray-600">{c.patente || '-'}</td>
                    <td className="px-4 py-3">
                      {c.segmento ? (
                        <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-medium text-brand-blue">
                          {c.segmento}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.estado === 'activo'
                            ? 'bg-brand-green/10 text-brand-green'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <p>
                Pagina {data.page} de {data.totalPages} ({data.total} clientes)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
