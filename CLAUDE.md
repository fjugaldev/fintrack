# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de desarrollo

```bash
pnpm dev        # Servidor de desarrollo (Next.js)
pnpm build      # Build de producción
pnpm start      # Servidor de producción
pnpm lint       # ESLint
```

No hay comandos de test configurados aún (proyecto en fase inicial).

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router) + Shadcn UI + Tailwind CSS v4 |
| Base de datos | Supabase (Postgres) + Drizzle ORM |
| Autenticación | Supabase Auth (email OTP 6 dígitos, Google, Facebook) |
| AI / OCR | Claude Haiku 4.5 (MVP) → Gemini 2.5 Flash (SaaS) |
| Storage | Supabase Storage (fotos de tickets) |
| Charts | Recharts |
| Billing | Polar.sh |
| Cron | Supabase Edge Functions + pg_cron |
| Deploy | Vercel (frontend) + Supabase Cloud |
| PWA | Serwist (`@serwist/next`) + idb (offline sync) |
| Package manager | pnpm |

## Arquitectura

El proyecto usa **Next.js App Router** con código fuente en `src/`:

- `src/app/` — Rutas y layouts (convención de Next.js App Router)
- `src/app/layout.tsx` — Layout raíz con fuentes Geist y metadata global
- `src/app/globals.css` — Estilos globales, variables CSS de tema, import de Tailwind v4

**Path alias**: `@/*` → `./src/*` (configurado en `tsconfig.json`)

**TypeScript**: strict mode habilitado.

**Tailwind CSS v4**: configurado vía PostCSS (`@tailwindcss/postcss`). No hay archivo `tailwind.config.*`; la configuración va dentro de `globals.css` con `@theme`.

## Estado actual del proyecto

Proyecto en fase inicial (greenfield). El stack de la spec (`docs/fintrack-spec.html`) aún no está implementado: no hay base de datos, autenticación, ni lógica de negocio. La spec define las fases de desarrollo (MVP → SaaS).

## Funcionalidades planificadas (spec)

Ver `docs/fintrack-spec.html` para el detalle completo. En resumen:
- Autenticación y onboarding con Supabase Auth
- Gestión de cuentas, transacciones y categorías
- Captura de tickets por foto con OCR + AI (Claude/Gemini)
- Presupuestos, metas de ahorro y seguimiento de precios
- Dashboard con visualizaciones (Recharts)
- Reportes, notificaciones y alertas
- PWA con soporte offline
- Monetización SaaS vía Polar.sh
