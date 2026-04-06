# Telemetria Posventa — Roadmap

## Estado actual: 4 fases completadas

**Fecha ultima actualizacion:** 2026-04-06

---

## Completado

### Infraestructura
- [x] Proyecto Next.js 16 + React 19 + Tailwind CSS v4 scaffoldeado
- [x] Prisma v7 con schema completo (8 modelos: User, Concesionario, Cliente, Campana, CampanaCliente, RegistroTelemetria, VehiculoStock, Oportunidad)
- [x] PostgreSQL en Railway (online, schema synced, seed cargado)
- [x] Prisma v7 con PrismaPg adapter configurado
- [x] NextAuth.js con CredentialsProvider + JWT sessions
- [x] Login page + middleware de proteccion de rutas
- [x] Proyecto deployado en Vercel

### Fase 1: Diagnostico de Brecha
- [x] Calculo de brecha: capacidad instalada vs ocupacion real
- [x] Grilla visual de elevadores (llenos/vacios)
- [x] Gauge semicircular de absorcion de costos fijos (Recharts)
- [x] Chart de mix actual vs ideal (Recharts BarChart)
- [x] Alerta de brecha ("Te faltan X autos por dia")
- [x] Resumen ejecutivo generado por IA (Claude API con fallback sin API key)
- [x] Dashboard con KPIs agregados (brecha total, ingreso no capturado, lista de concesionarios)

### Fase 2: Pipeline de Activacion
- [x] Segmentacion automatica de clientes por reglas deterministas (5 segmentos)
- [x] Generacion de mensajes WhatsApp con Claude API (variantes A/B)
- [x] Vista kanban de campanas: Borrador → Activa → Pausada → Completada
- [x] Tracking individual por cliente: pendiente → enviado → respondio → turno → completado
- [x] Boton copiar mensaje personalizado (para pegar en WhatsApp)

### Fase 3: Matching Comercial
- [x] Carga manual de stock de vehiculos (0km y usados) + importacion desde Excel
- [x] Cruce cliente-stock por antiguedad, km y scoring (0-100 pts)
- [x] Generacion de oferta concreta via IA
- [x] Tracking de oportunidades: generada → contactado → interesado → vendido/descartado

### Fase 4: Telemetria de Resultados
- [x] Registro diario de metricas (formulario de carga manual)
- [x] Dashboard 4 cuadrantes: ingresos, ocupacion, mix de servicios, brecha
- [x] Graficos temporales con Recharts (LineChart, AreaChart, StackedBarChart, BarChart)
- [x] KPIs mensuales: ingreso total, ocupacion promedio, turnos totales, ventas cerradas
- [x] Selector de mes calendario
- [x] Edicion y eliminacion de registros

### UI y Funcionalidades generales
- [x] Layout con sidebar (Telemetria branding, nav Dashboard + Concesionarios, logout)
- [x] CRUD completo de concesionarios (API + UI: lista, crear, detalle/hub)
- [x] Importacion de clientes desde Excel/CSV (upload, preview, mapeo de columnas, deduplicacion)
- [x] Seed data: Automotores del Sur (Toyota, Neuquen) + 50 clientes variados
- [x] Utilidades: formatARS, formatPercent, formatNumber (formato argentino)
- [x] Archivos Excel de ejemplo para clientes y stock

### Datos de prueba (seed)
- Admin: `admin@telemetria.com` / `admin123`
- Concesionario: Automotores del Sur (8 elevadores, 55% ocupacion, Toyota, Neuquen)
- 50 clientes con modelos, km, patentes y servicios variados

---

## Pendiente — Mejoras futuras

### Mejoras generales
- [ ] Edicion de concesionario (formulario pre-llenado)
- [ ] Busqueda/filtro de clientes por segmento, estado, modelo
- [ ] Export de datos a Excel
- [ ] Notificaciones en el dashboard
- [ ] Historial de cambios por concesionario

---

## Stack tecnico

| Componente | Tecnologia | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.2 |
| React | React | 19.2.4 |
| CSS | Tailwind CSS | v4.2.2 |
| ORM | Prisma | 7.6.0 |
| DB | PostgreSQL | Railway |
| Auth | NextAuth.js | 4.24.13 |
| Charts | Recharts | 3.8.1 |
| Excel | SheetJS (xlsx) | 0.18.5 |
| Icons | Lucide React | 1.7.0 |
| IA | Anthropic SDK | 0.82.0 |
| Deploy | Vercel | Activo |

## Paleta de colores
- Naranja (alerta/brecha): `#D85A30` → `brand-orange`
- Azul (acciones): `#378ADD` → `brand-blue`
- Verde (positivo): `#1D9E75` → `brand-green`
