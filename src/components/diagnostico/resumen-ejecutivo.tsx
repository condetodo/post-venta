'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react'
import type { DiagnosticoResult } from '@/lib/diagnostico'

interface ResumenEjecutivoProps {
  diagnostico: DiagnosticoResult
  dealer: { nombre: string; marca: string; ciudad: string }
}

export default function ResumenEjecutivo({
  diagnostico,
  dealer,
}: ResumenEjecutivoProps) {
  const [resumen, setResumen] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function generar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ia/resumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico, dealer }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al generar el resumen')
        return
      }
      setResumen(data.resumen)
    } catch {
      setError('Error de conexion al generar el resumen')
    } finally {
      setLoading(false)
    }
  }

  async function copiar() {
    if (!resumen) return
    await navigator.clipboard.writeText(resumen)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Resumen Ejecutivo
        </h3>
        {resumen && (
          <button
            onClick={copiar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
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
      </div>

      {!resumen && !loading && !error && (
        <button
          onClick={generar}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
        >
          <Sparkles className="h-4 w-4" />
          Generar Resumen Ejecutivo
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando resumen con IA...
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={generar}
            className="mt-2 text-xs font-medium text-red-600 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {resumen && (
        <div className="prose prose-sm max-w-none whitespace-pre-line font-serif text-gray-700 leading-relaxed">
          {resumen}
        </div>
      )}
    </div>
  )
}
