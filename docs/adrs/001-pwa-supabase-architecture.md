# ADR-001: PWA + Supabase Architecture (Same as Medical-Data-App)

## Status
Accepted

## Context
We need to build a home event tracker for recording fixes, maintenance, and improvement projects. We have a proven architecture from the medical-data-app that follows these patterns:
- React PWA (mobile-first, installable, offline-capable)
- Supabase (PostgreSQL + Storage)
- Layered architecture (Domain → Infrastructure → UI/CLI)
- In-memory stubs for testing and offline development
- CLI with feature parity

## Decision
Replicate the medical-data-app architecture with the same tech stack:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **PWA**: vite-plugin-pwa (Workbox) for installability and offline read support
- **Backend**: Supabase (PostgreSQL with RLS, Storage for photos)
- **CLI**: Commander.js with full CRUD feature parity
- **Testing**: Vitest (unit) + Playwright (E2E) + CLI scenarios
- **CI/CD**: GitHub Actions → Vercel deployment
- **Domain separation**: Pure TS domain layer, no framework dependencies
- **Store provider pattern**: Auto-selects Supabase or in-memory stubs

### Domain Model
- **HomeEvent**: Core entity for fixes (Reparación), maintenance (Mantención), and projects (Proyecto)
- **HomeArea**: User-defined zones of the house (Cocina, Baño, Techo, etc.)
- **EventPhoto**: Photos uploaded to Supabase Storage
- **MaintenanceSchedule**: Recurring maintenance with due/overdue tracking

### Key Attributes
- All events have: type, priority (low/medium/high/urgent), status (not_started/in_progress/completed/cancelled)
- Cost tracking: materials, labor, and total cost
- Visual indicators for overdue/upcoming maintenance (no push notifications)

## Consequences
- ✅ Proven architecture — reduces risk and development time
- ✅ Full offline development (in-memory stubs)
- ✅ CLI validation for automated testing
- ✅ Mobile-first PWA — installable on any device
- ✅ Zero hosting cost (Supabase free tier + Vercel free tier)
- ⚠️ No offline write support (requires Supabase connection)
- ⚠️ Storage limited to Supabase free tier (1GB for photos)
