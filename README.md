# HomeTracker — Registro del Hogar

Progressive Web App (PWA) for tracking home-related events: repairs, regular maintenance, and improvement projects.

## Features

- 🔧 **Reparaciones** — Track unplanned fixes to appliances and home systems
- 🔄 **Mantenciones** — Schedule and track recurring maintenance tasks with due/overdue indicators
- 🏗️ **Proyectos** — Plan and track home improvement projects with status tracking
- 📸 **Fotos** — Attach before/after photos, receipts, and documentation
- 💰 **Costos** — Track materials, labor, and total costs per event
- 🏠 **Áreas** — Organize events by user-defined house zones (Cocina, Baño, Techo, etc.)
- 📱 **PWA** — Mobile-first, installable, works on any device
- ⌨️ **CLI** — Full command-line interface for automation

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| PWA | vite-plugin-pwa (Workbox) |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL) |
| Photos | Supabase Storage |
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| CLI | Commander.js |
| CI/CD | GitHub Actions → Vercel |

## Requirements

- Node.js 22+
- Supabase account (free tier) — optional for local development

## Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without Supabase credentials, the app runs with in-memory storage (data lost on reload).

## Commands

```bash
npm run dev            # Development server
npm run build          # Production build
npm run test           # Unit tests
npm run test:coverage  # Unit tests with coverage
npm run test:e2e       # E2E tests (Playwright)
npm run cli            # CLI interface
```

## Architecture

See [docs/adrs/](docs/adrs/) for architecture decision records.

## Production

- **URL**: https://home-tracker-app.vercel.app
- **CI/CD**: Push to `master` → GitHub Actions (test + build) → Vercel deploy
- **Backups**: Weekly DB export to `backups` branch
