# ADR-0001: Frontend-first prototype stack (no Prisma/Postgres yet)

Status: accepted (requested directly by the product owner)

## Context
`CLAUDE.md` is an unfilled template that assumes Next.js + Prisma + PostgreSQL. The product brief for
Ghuri Bangladesh asks for a polished frontend with realistic seed data first, and a backend
(Supabase) only "where appropriate".

## Decision
- Next.js (App Router) + TypeScript + Tailwind CSS v4 + lucide-react. UI primitives are hand-written
  in shadcn style (no Radix dependency yet).
- **No Prisma/Postgres, no Supabase yet.** User state (marks, trips, profile) lives in
  `localStorage` behind `src/lib/store.ts`; seed data is typed modules in `src/data/`.
- The map is SVG, not Mapbox: real BBS district boundaries (geoBoundaries, CC BY 3.0 IGO) are
  simplified and pre-projected by `scripts/build-map.mjs` into `src/data/map-paths.json`. No API key needed.
- Photos come from Wikimedia Commons via `scripts/fetch-images.mts` into `src/data/images.json`,
  with author/licence/source stored and displayed. Places without a match fall back to illustrated covers.
- Runtime dependencies: next, react, react-dom, lucide-react, clsx, tailwind-merge.

## Consequences
- Auth is a local profile only; "Google/email login" needs a real provider (Supabase Auth).
- To add a backend: replace the `actions` in `src/lib/store.ts` with API/Supabase calls and
  `src/data/*` with queries; components consume only `src/lib/data.ts` and the store hooks.
- Share links encode a snapshot in the URL (`/share?...`) because there is no server-side profile store.
- Seed content is hand-written and must be fact-checked before launch.
