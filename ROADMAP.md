# Telemetria Posventa — Roadmap

## Estado actual: MVP en desarrollo

**Fecha ultima actualizacion:** 2026-04-04

---

## Completado

### Infraestructura
- [x] Proyecto Next.js 16 + React 19 + Tailwind CSS v4 scaffoldeado
- [x] Prisma v7 con schema completo (6 modelos: User, Concesionario, Cliente, Campana, CampanaCliente, RegistroTelemetria)
- [x] PostgreSQL en Railway (online, schema synced, seed cargado)
- [x] Prisma v7 con PrismaPg adapter configurado
- [x] NextAuth.js con CredentialsProvider + JWT sessions
- [x] Login page + middleware de proteccion de rutas
- [x] Proyecto preparado para deploy en Vercel (postinstall, serverExternalPackages, middleware compatible)

### UI y Funcionalidades
- [x] Layout con sidebar (Telemetria branding, nav Dashboard + Concesionarios, logout)
- [x] CRUD completo de concesionarios (API + UI: lista, crear, detalle/hub)
- [x] Importacion de clientes desde Excel/CSV (upload, preview, mapeo de columnas, deduplicacion)
- [x] Modulo de Diagnostico (MVP core):
  - Calculo de brecha: capacidad instalada vs ocupacion real
  - Grilla visual de elevadores (llenos/vacios)
  - Gauge semicircular de absorcion de costos fijos (Recharts)
  - Chart de mix actual vs ideal (Recharts BarChart)
  - Alerta de brecha ("Te faltan X autos por dia")
  - Resumen ejecutivo generado por IA (Claude API con fallback sin API key)
- [x] Dashboard con KPIs agregados (brecha total, ingreso no capturado, lista de concesionarios)
- [x] Seed data: Automotores del Sur (Toyota, Neuquen) + 50 clientes variados
- [x] Utilidades: formatARS, formatPercent, formatNumber (formato argentino)

### Datos de prueba (seed)
- Admin: `admin@telemetria.com` / `admin123`
- Concesionario: Automotores del Sur (8 elevadores, 55% ocupacion, Toyota, Neuquen)
- 50 clientes con modelos, km, patentes y servicios variados

---

## Pendiente - Bloqueantes para produccion

### Bug: Login no funciona
- **Problema:** El login con NextAuth.js redirige de vuelta a /login en vez de ir al dashboard
- **Posible causa:** Compatibilidad bcryptjs v3 con el hash guardado, o problema con NextAuth + Next.js 16
- **Diagnostico pendiente:** Verificar que bcrypt.compare() funcione con el hash del seed, revisar logs del server durante el login
- **Prioridad:** CRITICA — sin esto no se puede usar la app

### Deploy a Vercel
- **Estado:** Proyecto preparado pero NO deployado
- **Pendiente:**
  - Resolver bug de login primero
  - Configurar env vars en Vercel: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (url de produccion), ANTHROPIC_API_KEY
  - Ejecutar deploy via Vercel MCP o `vercel deploy`
  - Repo GitHub: https://github.com/condetodo/post-venta

---

## Pendiente - Proximas funcionalidades

### Fase 2: Pipeline de Activacion (/concesionarios/[id]/pipeline)
- [ ] Segmentacion automatica de clientes por reglas deterministas:
  - service_vencido (>6 meses), km_alto, garantia_prox (<3 anios), renovacion (>4 anios), express
- [ ] Generacion de mensajes WhatsApp con Claude API (variantes A/B)
- [ ] Vista kanban de campanas: Borrador → Activa → Pausada → Completada
- [ ] Tracking individual por cliente: pendiente → enviado → respondio → turno → completado
- [ ] Boton copiar mensaje personalizado (para pegar en WhatsApp)

### Fase 3: Matching Comercial (/concesionarios/[id]/matching)
- [ ] Carga manual de stock de vehiculos (0km y usados)
- [ ] Cruce cliente-stock por antiguedad y km
- [ ] Generacion de oferta concreta via IA ("Tu Corolla 2019 cotizado en $X, tenemos SW4 en stock...")
- [ ] Flag/notificacion al asesor comercial
- [ ] Tracking de oportunidades de venta generadas desde posventa

### Fase 4: Telemetria de Resultados (/concesionarios/[id]/telemetria)
- [ ] Registro diario de metricas (formulario de carga)
- [ ] Dashboard 4 cuadrantes: ingresos, absorcion, productividad, ventas atribuidas
- [ ] Graficos temporales con Recharts
- [ ] KPIs: tasa de conversion, ROI del sistema

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
| Deploy | Vercel (pendiente) | — |

## Paleta de colores
- Naranja (alerta/brecha): `#D85A30` → `brand-orange`
- Azul (acciones): `#378ADD` → `brand-blue`
- Verde (positivo): `#1D9E75` → `brand-green`
