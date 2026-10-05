# [Project Name]

<!-- One or two sentences: what this app does, who it's for. -->

## Stack

Next.js (App Router) + TypeScript, Prisma + PostgreSQL. <!-- fill in: package manager,
auth approach, styling approach, deployment target -->

## Commands

<!-- Confirm these against the actual package.json before trusting them -->

```
npm run dev          # local dev server
npm run build         # production build
npm run test           # unit/integration tests
npm run test:e2e      # end-to-end tests (Playwright)
npm run lint             # ESLint
npm run typecheck    # tsc --noEmit
npx prisma migrate dev   # apply schema changes locally
npx prisma studio        # browse the database visually
```

## Conventions

<!-- Fill in with what's actually true for this repo, e.g.: -->
- Route Handlers under `app/api/**/route.ts` call service functions in `lib/services/*.ts`.
  <!-- or: Server Actions are used for X, Route Handlers for Y — state the actual rule -->
- Input validation via Zod schemas in `lib/validations/*.ts`.
- Auth/authorization pattern: <!-- describe the actual chokepoint function(s), e.g.
  requireAuth(), requireOrganizationAccess() — name them explicitly -->
- **Never trust a client-supplied ID (user/org/resource) for an authorization decision** —
  always re-derive access from the authenticated session server-side.
- **No narrating comments.** Don't comment what the code already says (`// increment` above
  `i++`), obvious section headers, or restating a well-named function. Prefer a clearer
  name to a comment explaining an unclear one. Comment only genuinely non-obvious business
  rules or workarounds for a specific bug/library quirk.

## Documentation is authoritative

If this repo has a `docs/` folder, it — not this file — is the source of truth for
architecture, data model, API surface, and conventions. This file states *which* document
governs *what*; it does not restate their content:
<!-- fill in once docs/ exists, e.g.: -->
<!-- - Module structure & data model: docs/architecture.md, docs/data-model.md -->
<!-- - API surface: docs/api.md (generated OpenAPI: link, not duplicated) -->
<!-- - Testing strategy: docs/testing.md -->

**ADRs are required** (drafted for approval before implementation, not written after) when
a change: introduces or drops a dependency or external service, changes the data model,
changes an API contract, changes auth/authorization, introduces a new architectural
pattern, or deviates from a documented convention. Otherwise, no ADR needed — say so
explicitly rather than leaving it unaddressed. A reversed decision gets a **new** ADR; the
old one is marked `Status: superseded by ADR-NNNN`, never edited to look like it said
something else. Doc updates (including new/updated ADRs) ship in the **same PR** as the
code they describe.

If the issue conflicts with something documented here or in `docs/`, that's a stop
condition — surface it, don't silently follow either one.

## Definition of done

- `npm run typecheck`, `npm run lint` (new/touched files clean), `npm run test`,
  `npm run test:e2e` (for user-facing flow changes), and `npm run build` all pass.
- Lint is enforced on touched files; pre-existing violations elsewhere are tracked
  separately, not blocking, unless this section is updated to say otherwise.
- Conventional commit messages.

## Postgres / Prisma notes (PG15+)

If a fresh database user hits `permission denied to create database` or
`permission denied for schema public` during `prisma migrate dev`, this is usually one
of the following (all VPS/self-hosted setups run into this):

- The role lacks `CREATEDB`: `ALTER USER <user> CREATEDB;` (run as a superuser).
- PG15+ restricts `CREATE` on the `public` schema by default:
  `GRANT ALL ON SCHEMA public TO <user>;` — run this against the **actual target
  database** you're connecting to (not a bare superuser session).
- If migrations use a shadow database, also grant on `template1`, since new databases
  inherit `public`'s ACL from it at creation time:
  `\c template1` then `GRANT ALL ON SCHEMA public TO <user>;`
- Check the role isn't silently redirected to another role on login:
  `SELECT rolname, rolconfig FROM pg_roles WHERE rolname = '<user>';` — if `rolconfig`
  shows a `role=...` entry, that's the real cause; fix with
  `ALTER ROLE <user> RESET role;` (run as superuser).

## Never do

- Never commit directly to `main`.
- Never force-push or rewrite pushed history.
- Never add a dependency, delete or edit an existing migration file, or edit
  `.github/workflows/**` without asking first.
- Never run `npm audit fix --force` without asking first — it can pull breaking major
  version bumps.
- Never bump a framework's major version (e.g. Next.js) without asking first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
