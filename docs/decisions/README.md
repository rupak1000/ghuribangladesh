# Architecture Decision Records

One file per decision, `ADR-NNNN-slug.md`, using `ADR-TEMPLATE.md`. Numbers are sequential
and never reused. A reversed decision gets a **new** ADR — the old one is marked
`Status: superseded by ADR-NNNN`, never edited to look like it said something else.

| ADR | Title | Status |
|-----|-------|--------|
| [0001](ADR-0001-frontend-prototype-stack.md) | Frontend-first prototype stack | accepted |
| [0002](ADR-0002-home-district.md) | Home district on share card and wall map | accepted |
| [0003](ADR-0003-postgres-for-shared-profiles-and-trips.md) | PostgreSQL (via Prisma) for shared profiles and trips | accepted |
| [0004](ADR-0004-accounts-and-synced-map.md) | Optional email accounts with the map stored in PostgreSQL | superseded by ADR-0005 |
| [0005](ADR-0005-email-only-sign-in.md) | Email-only sign-in for online accounts | accepted |
