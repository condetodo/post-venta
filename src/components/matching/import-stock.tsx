'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportStockProps {
  concesionarioId: string
  onImportComplete: () => void
}

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

const TARGET_FIELDS = [
  { key: 'marca', label: 'Marca', required: true },
  { key: 'modelo', label: 'Modelo', required: true },
  { key: 'version', label: 'Version', required: false },
  { key: 'anio', label: 'Anio', required: true },
  { key: 'tipo', label: 'Tipo (0km/usado)', required: true },
  { key: 'precio', label: 'Precio', required: true },
  { key: 'moneda', label: 'Moneda', required: false },
  { key: 'color', label: 'Color', required: false },
  { key: 'notas', label: 'Notas', required: false },
] as const

const AUTO_MATCH_PATTERNS: Record<string, string[]> = {
  marca: ['marca', 'brand', 'make'],
  modelo: ['modelo', 'model'],
  version: ['version', 'trim', 'variante'],
  anio: ['anio', 'año', 'year', 'ano'],
  tipo: ['tipo', 'type', 'condicion', '0km', 'nuevo', 'usado'],
  precio: ['precio', 'price', 'valor', 'importe'],
  moneda: ['moneda', 'currency', 'divisa'],
  color: ['color', 'colour'],
  notas: ['nota', 'observ', 'comentario', 'note'],
}

function autoDetectMapping(headers: string[]): Record<string, number | null> {
  const mapping: Record<string, number | null> = {}

  for (const field of TARGET_FIELDS) {
    const patterns = AUTO_MATCH_PATTERNS[field.key] || []
    const matchIndex = headers.findIndex((h) => {
      const lower = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return patterns.some((p) => lower.includes(p))
    })
    mapping[field.key] = matchIndex >= 0 ? matchIndex : null
  }

  return mapping
}

export default function ImportStock({
  concesionarioId,
  onImportComplete,
}: ImportStockProps) {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])
  const [allRows, setAllRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, number | null>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setFile(null)
    setHeaders([])
    setPreviewRows([])
    setAllRows([])
    setMapping({})
    setImporting(false)
    setResult(null)
    setParseError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const parseFile = useCallback(async (selectedFile: File) => {
    setParseError(null)
    setResult(null)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

      if (data.length < 2) {
        setParseError('El archivo debe tener al menos una fila de encabezados y una de datos.')
        return
      }

      const fileHeaders = (data[0] || []).map((h) => String(h || '').trim())
      const rows = data.slice(1).filter((row) => row.some((cell) => cell !== undefined && cell !== ''))

      if (rows.length === 0) {
        setParseError('El archivo no contiene datos.')
        return
      }

      setFile(selectedFile)
      setHeaders(fileHeaders)
      setPreviewRows(rows.slice(0, 5).map((r) => r.map((c) => String(c ?? ''))))
      setAllRows(rows.map((r) => r.map((c) => String(c ?? ''))))
      setMapping(autoDetectMapping(fileHeaders))
    } catch {
      setParseError('Error al leer el archivo. Asegurate de que sea un archivo Excel o CSV valido.')
    }
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) parseFile(selected)
    },
    [parseFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const dropped = e.dataTransfer.files[0]
      if (dropped) parseFile(dropped)
    },
    [parseFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const updateMapping = useCallback((field: string, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === '' ? null : parseInt(value, 10),
    }))
  }, [])

  const canImport = TARGET_FIELDS.filter((f) => f.required).every(
    (f) => mapping[f.key] !== null && mapping[f.key] !== undefined
  )

  const handleImport = useCallback(async () => {
    if (!canImport) return

    setImporting(true)
    try {
      const vehiculos = allRows.map((row) => {
        const obj: Record<string, string | undefined> = {}
        for (const field of TARGET_FIELDS) {
          const colIndex = mapping[field.key]
          if (colIndex !== null && colIndex !== undefined) {
            obj[field.key] = row[colIndex] ?? undefined
          }
        }
        return obj
      })

      const res = await fetch(
        `/api/concesionarios/${concesionarioId}/matching/stock/import`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehiculos }),
        }
      )

      const data = await res.json()
      setResult(data)
      onImportComplete()
    } catch {
      setResult({ imported: 0, skipped: 0, errors: ['Error de conexion con el servidor'] })
    } finally {
      setImporting(false)
    }
  }, [allRows, canImport, concesionarioId, mapping, onImportComplete])

  // Result view
  if (result) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-green" />
          <h3 className="text-lg font-semibold text-gray-900">Importacion completada</h3>
        </div>
        <div className="mb-4 space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium text-brand-green">{result.imported}</span> vehiculos importados
          </p>
          {result.skipped > 0 && (
            <p>
              <span className="font-medium text-brand-orange">{result.skipped}</span> omitidos por duplicados
            </p>
          )}
          {result.errors.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-red-600">
                {result.errors.length} errores:
              </p>
              <ul className="max-h-40 overflow-y-auto rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={reset}
          className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90"
        >
          Importar otro archivo
        </button>
      </div>
    )
  }

  // No file yet - dropzone
  if (!file) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10 transition-colors hover:border-brand-orange/50 hover:bg-brand-orange/5"
        >
          <Upload className="mb-3 h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Arrastra un archivo o hace clic para seleccionar
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Formatos aceptados: .xlsx, .csv
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        {parseError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {parseError}
          </div>
        )}
      </div>
    )
  }

  // File loaded - mapping & preview
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* File info */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-brand-green" />
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {allRows.length} filas detectadas
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Column mapping */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Mapeo de columnas
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TARGET_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              <select
                value={mapping[field.key] ?? ''}
                onChange={(e) => updateMapping(field.key, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
              >
                <option value="">-- No mapear --</option>
                {headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Preview table */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Vista previa (primeras {previewRows.length} filas)
        </h4>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap border-b border-gray-200 px-3 py-2 font-medium text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} className="border-b border-gray-100 last:border-0">
                  {headers.map((_, ci) => (
                    <td
                      key={ci}
                      className="whitespace-nowrap px-3 py-2 text-gray-600"
                    >
                      {row[ci] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleImport}
          disabled={!canImport || importing}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Importar {allRows.length} vehiculos
            </>
          )}
        </button>
        {!canImport && (
          <p className="text-xs text-red-500">
            Mapea todos los campos requeridos (*) para continuar
          </p>
        )}
      </div>
    </div>
  )
}
