# Running Ghuri Bangladesh on a VPS with PostgreSQL

Shared profiles (`/u/<id>`) and shared trips (`/trip/<id>`) are stored in PostgreSQL
(see ADR-0003). Everything else stays in each visitor's browser.

## 1. Create the database (once, on the VPS)

```sh
sudo -u postgres psql
```

```sql
CREATE USER ghuri WITH PASSWORD 'choose-a-strong-password';
CREATE DATABASE ghuri OWNER ghuri;
\c ghuri
GRANT ALL ON SCHEMA public TO ghuri;
```

If `prisma migrate` later reports `permission denied for schema public`, the `GRANT`
above was run against the wrong database. Run it again after `\c ghuri`.

## 2. Configure

Copy `.env.example` to `.env` next to `package.json` and set the real password:

```
DATABASE_URL="postgresql://ghuri:choose-a-strong-password@localhost:5432/ghuri?schema=public"
```

## 3. Install, migrate, build, start

```sh
npm ci
npm run db:migrate      # creates the Profile and SharedTrip tables
npm run build
npm run start           # keep it running with pm2 or systemd
```

## 4. Move existing links (optional)

If you already have `.data/profiles.json` or `.data/trips.json` from local use, copy
them to the same place on the VPS and run once:

```sh
npm run db:import
```

Existing links keep the same ids and edit tokens.

## Backups

```sh
pg_dump -U ghuri ghuri > ghuri-$(date +%F).sql
```
