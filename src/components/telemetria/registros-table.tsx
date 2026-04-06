"use client"

import { Pencil, Trash2 } from "lucide-react"
import { formatARS } from "@/lib/format"

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

interface RegistrosTableProps {
  registros: RegistroTelemetria[]
  onEdit: (registro: RegistroTelemetria) => void
  onDelete: (registroId: string) => void
}

function formatFechaDDMM(fecha: string): string {
  const date = new Date(fecha)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}/${month}`
}

export type { RegistroTelemetria, RegistrosTableProps }

export function RegistrosTable({ registros, onEdit, onDelete }: RegistrosTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <h3 className="p-4 text-sm font-semibold text-gray-900 border-b border-gray-100">
        Registros del Mes
      </h3>

      {registros.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No hay registros en este mes.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Turnos</th>
              <th className="px-4 py-3">Elev.</th>
              <th className="px-4 py-3">Ingreso</th>
              <th className="px-4 py-3">Mix (M/C/E)</th>
              <th className="px-4 py-3">Oport.</th>
              <th className="px-4 py-3">Ventas</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registros.map((registro) => (
              <tr key={registro.id}>
                <td className="px-4 py-3 text-gray-700">
                  {formatFechaDDMM(registro.fecha)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {registro.turnosDelDia}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {registro.elevadoresUsados}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatARS(registro.ingresoDia)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {registro.mixMecanica}/{registro.mixChapa}/{registro.mixExpress}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {registro.oportunidadesVenta}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {registro.ventasCerradas}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-brand-blue"
                      onClick={() => onEdit(registro)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={() => {
                        if (window.confirm("Eliminar este registro?")) {
                          onDelete(registro.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
