# Telemetria Inteligente de Posventa - Design Document

**Fecha**: 2026-04-04
**Estado**: Aprobado

## Problema

Los talleres de concesionarios argentinos operan con 40-50% de capacidad ociosa. No hay herramienta que diagnostique la brecha, genere demanda segmentada para llenarla, ni detecte oportunidades de venta desde el trafico del taller.

## Solucion

Herramienta web interna para consultor automotriz. No es SaaS multi-tenant. Un solo usuario admin opera el sistema para multiples concesionarios clientes.

## Stack

- Next.js 15 (App Router) + React + Tailwind CSS
- PostgreSQL (Railway) + Prisma ORM
- NextAuth.js (CredentialsProvider, un usuario admin)
- Claude API (Sonnet 4) via @anthropic-ai/sdk
- Deploy: Railway
- Charts: Recharts
- Excel: SheetJS (xlsx)
- Iconos: Lucide React
- Moneda: Intl.NumberFormat('es-AR') nativo

## Modelo de Datos

### Entidades principales

- **User**: auth (email, password bcrypt)
- **Concesionario**: datos del dealer + capacidad del taller (elevadores, horas, dias, costos, mix)
- **Cliente**: datos del cliente + vehiculo + segmentacion IA + scoring renovacion
- **Campana**: campanas de activacion con metricas de conversion
- **CampanaCliente**: relacion M:N con estado individual por cliente
- **RegistroTelemetria**: metricas diarias por concesionario

### Ajustes al schema original

1. `onDelete: Cascade` en Cliente->Concesionario y Campana->Concesionario
2. Indice unico `@@unique([concesionarioId, patente])` en Cliente
3. Modelo User agregado para NextAuth

## Modulos

### 1. Dashboard (/dashboard)
KPIs agregados, lista de concesionarios, acceso rapido.

### 2. Concesionarios (/concesionarios)
CRUD + importacion Excel/CSV con preview, mapeo de columnas, validacion, deduplicacion por patente.

### 3. Diagnostico (/concesionarios/[id]/diagnostico) - MVP
Calculo de brecha: capacidad instalada vs ocupacion real.
- Formulas: capacidad = elevadores x (horas/1.5) x dias
- Visualizacion: grilla elevadores, gauge absorcion, comparativa mix, alerta de autos faltantes
- Resumen ejecutivo generado por Claude API

### 4. Pipeline (/concesionarios/[id]/pipeline)
4 pasos: Segmentacion (reglas deterministas) -> Diseno (mensajes IA) -> Activacion (kanban) -> Gestion (tracking conversion)

### 5. Matching (/concesionarios/[id]/matching)
Cruce cliente-stock para oportunidades de venta. Oferta concreta generada por IA.

### 6. Telemetria (/concesionarios/[id]/telemetria)
Dashboard 4 cuadrantes: ingresos, absorcion, productividad, ventas atribuidas. Registro diario.

## Paleta de colores

- Negro/blanco base
- Naranja #D85A30: alertas, brecha
- Azul #378ADD: flujo 1, acciones
- Verde #1D9E75: resultados positivos

## Prioridad de implementacion

1. Setup proyecto + schema + auth
2. CRUD concesionarios + importacion Excel
3. Modulo diagnostico (MVP)
4. Pipeline de activacion + IA
5. Matching comercial
6. Dashboard telemetria
7. Seed data + polish
