# ADR-0003: PostgreSQL (via Prisma) for shared profiles and trips

**Status:** accepted

## Context

Shared public profiles (`/u/<id>`) and shared trips (`/trip/<id>`) are stored by
`src/lib/profileStore.ts` and `src/lib/tripStore.ts` in JSON files under `.data/`
(`profiles.json`, `trips.json`, git-ignored), read and written through
`src/app/api/profile/route.ts` and `src/app/api/trip/route.ts`. Everything else
(visited districts, marks, trips, language, theme, home district) lives only in the
browser's localStorage (`ghuri:v1`, `src/lib/store.ts`).

Consequences observed or expected:

- On hosting with a read-only or ephemeral filesystem (serverless platforms, containers
  without a volume), the JSON files are lost or cannot be written, so a copied profile
  link opens a "not found" page for other people.
- The file store has no concurrent-write safety beyond an in-process queue, so more than
  one server instance would overwrite each other.
- `CLAUDE.md` names Prisma + PostgreSQL as the intended stack, but neither is in
  `package.json` yet.

Deployment target: a VPS / own server, with a local PostgreSQL instance (decided with
the project owner).

## Decision

Store shared profiles and shared trips in PostgreSQL, accessed through Prisma.

- Add `prisma` (dev) and `@prisma/client` (both pinned to major 6, which needs no extra driver package) as dependencies, and a `DATABASE_URL`
  environment variable (documented in a new `.env.example`).
- Two tables replacing the two JSON files: `Profile` (id, token hash, JSON data,
  updated-at) and `SharedTrip` (id, JSON data, created-at). Same ids, same sanitising
  functions, same API routes and responses, so URLs and the client code do not change.
- `profileStore.ts` / `tripStore.ts` keep their exported function signatures; only the
  storage behind them changes.
- A one-off script imports existing `.data/*.json` entries so current links keep working.
- Browser localStorage stays the source of truth for a visitor's own map. Syncing a
  signed-in user's own data across devices is out of scope here and would need a new ADR
  (it requires real authentication).

## Consequences

- Share links work for anyone, on any host that can reach the database.
- Adds two dependencies, a PostgreSQL server to run and back up on the VPS, and a migration workflow
  (`npx prisma migrate dev`); `npm run build` must run `prisma generate`.
- Data model change: two new tables; no change to the public JSON shapes.
- Does not by itself make "my map" available on another device. That stays a separate
  decision.
