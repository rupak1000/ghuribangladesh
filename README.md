# claude-nextjs-template

Reusable Claude Code workflow setup for Next.js + Prisma projects: an implementer agent, a
four-agent design pipeline (direction → spec → implementation → critique), read-only
reviewer agents, a `/dev-issue` entry-point skill that routes work through the right
agents based on what kind of change it is, permission settings, and a `CLAUDE.md`
skeleton — built from real-world setup and debugging on a production project.

## What's in here

```
.claude/
  agents/
    implementer.md                # backend/non-UI code + tests, reads docs first, escalates per stop conditions
    design-director.md            # sets visual direction/spec BEFORE any code is written — plans, doesn't implement
    ui-ux-designer.md             # turns direction into a detailed hierarchy/spacing/interaction spec — plans, doesn't implement
    frontend-design-engineer.md   # implements the approved design with high visual fidelity
    design-critic.md              # strict read-only design review — hierarchy, spacing, generic-AI-pattern detection
    review-architecture.md        # App Router structure, server/client boundaries
    review-security.md            # authn/authz, input validation, secrets, data exposure
    review-data.md                # migration reversibility, transactions, N+1
    review-api-contract.md        # breaking changes to routes/actions/shared types
    review-tests.md               # test quality, edge cases, professional e2e coverage
    review-performance.md         # unbounded queries, client waterfalls, bundle impact
    docs-reviewer.md              # checks a PR diff against docs/ for drift, missing ADRs
    debugger.md                   # investigates a specific bug/failure, reports root cause; doesn't fix
  skills/
    dev-issue/
      SKILL.md                    # /dev-issue <issue-number> — classifies the issue and routes it through the right agents
    premium-ui-design/
      SKILL.md                    # shared design principles: composition, hierarchy, avoiding generic AI patterns
    design-system/
      SKILL.md                    # find and respect this repo's actual design tokens instead of inventing new ones
    e2e-testing/
      SKILL.md                    # page object model, accessible locators, a11y checks, reliability discipline
    init-docs/
      SKILL.md                    # two-phase: derive docs from code, then make them binding
    doc-audit/
      SKILL.md                    # on-demand, whole-repo doc drift audit (not just a PR diff)
  settings.json                    # pre-allowed safe commands, denied dangerous ones, Stop hook reminder
docs/
  decisions/
    ADR-TEMPLATE.md                # MADR-style template
    README.md                      # ADR index
  findings.md                      # inconsistencies found while documenting; not fixed, just recorded
.github/
  PULL_REQUEST_TEMPLATE.md        # doc-impact and ADR fields, verification checklist
  workflows/
    ci.yml                         # runs typecheck/lint/test/build on every PR to main
CLAUDE.md                           # skeleton — fill in per project
SETUP_PROMPT.md                     # paste into a fresh Claude Code session
```

### The design pipeline, and why it's four separate agents

UI work is routed through four agents in sequence rather than one agent doing everything,
because planning and implementing are different skills and mixing them produces exactly
the generic-AI-dashboard look this pipeline exists to avoid:

1. **design-director** inspects the existing app and decides the visual *direction* —
   personality, hierarchy, layout strategy — before any component gets chosen.
2. **ui-ux-designer** turns that direction into a detailed spec — exact hierarchy,
   spacing rhythm, typography scale, every interaction state.
3. **frontend-design-engineer** implements it with Tailwind/shadcn, matching the spec
   exactly rather than reinterpreting it.
4. **design-critic** reviews the result adversarially — it exists specifically to catch
   "too many cards," "everything in a rounded rectangle," and other generic-AI tells
   before the user sees them.

`dev-issue`'s Step 1 classifies each issue and only routes UI/design work through this
full pipeline — a pure backend/API issue goes straight to `implementer`, skipping steps
3-4 (design) entirely.

### About the e2e-testing skill

E2E tests are the most expensive and flakiness-prone tests in the suite, so this template
holds them to a specific standard rather than accepting "a Playwright file exists": page
object model (not raw selectors inline), accessible-first locator strategy
(`getByRole`/`getByLabel` before `getByTestId` before CSS selectors), an automated
accessibility check (`@axe-core/playwright`) on primary flows, and a hard rule against
fixed `waitForTimeout` sleeps (the single biggest cause of flaky e2e suites). Both
`implementer`/`frontend-design-engineer` (writing e2e tests) and `review-tests` (reviewing
them) reference this same skill, so the bar is consistent on both sides.

### About ci.yml

Runs automatically on GitHub — no local setup needed. Typecheck, lint, unit tests, and
build run on every PR and every push to `main`, so you get a pass/fail check on the PR
page even if you (or Claude Code) forgot to run something locally. The e2e job is included
but **disabled by default** (`if: false`) — flip it on once your e2e tests don't need a
live database, or once you've added a `services:` block for a CI-safe Postgres container.
Never let CI run tests against a real/production database.

`.github/workflows/**` is deliberately left out of `settings.json`'s allow list, so Claude
Code will always ask before touching it — matching the "never edit CI config without
asking" rule, without hard-blocking it the way migrations are (CI edits are recoverable
via git; sometimes you'll want to approve a change, like enabling the e2e job).

### Two entry points

- **`/dev-issue <n>`** — day-to-day feature/bugfix work: issue → implement → verify → draft
  PR → review roster → triage → merge.
- **`init-docs`** (invoke by name, e.g. "run the init-docs skill/workflow") — one-time or
  occasional: derive `README.md` + `docs/` + `docs/decisions/` from the code that actually
  exists (phase 1), then wire docs into the dev-issue workflow as binding convention
  (phase 2, only after you accept phase 1). Run this once early in a project's life, or on
  an existing project with stale/no docs.
- **`doc-audit`** (invoke by name) — run any time you want a whole-repo drift check instead
  of just the current PR's diff.

## How to use this for a new project

**Option A — GitHub template repo (recommended)**

1. Mark this repo as a template on GitHub: Settings → General → check "Template repository".
2. For each new project:
   ```
   gh repo create your-new-project --template <your-username>/claude-nextjs-template --private --clone
   cd your-new-project
   claude
   ```
3. Tell Claude Code: *"This repo was created from a template. Read SETUP_PROMPT.md and run
   it against this repo's actual code."*

**Option B — copy into an existing project**

1. Copy `.claude/` and `CLAUDE.md` into your project root.
2. `cd` into the project, run `claude`.
3. Say: *"I copied a template `.claude/` setup and `CLAUDE.md` from another project. Read
   this repo's actual structure and conventions, then update both to match what's really
   here — don't assume anything carried over correctly."*

Either way, **Claude Code should re-verify everything against the real repo** rather than
trust the copied files blindly — package manager, test framework, whether e2e tooling
exists, the actual auth pattern, and so on all vary project to project even within the same
stack.

## Every-project checklist (things outside Claude Code's control)

Things worth doing yourself before or alongside the setup:

- [ ] `gh auth status` — confirm gh is authenticated for this account
- [ ] Postgres database + user created, with:
  - `CREATEDB` granted to the app user if migrations will run locally
  - `GRANT ALL ON SCHEMA public TO <user>;` on the actual target database (PG15+ default
    restricts this)
  - The same grant on `template1` if migrations use a shadow database
  - Confirm the role isn't redirected: `SELECT rolname, rolconfig FROM pg_roles WHERE
    rolname = '<user>';` should show empty `rolconfig`
- [ ] `.env` created (gitignored) with `DATABASE_URL` and any auth secret, generated fresh
  per environment — don't reuse one across projects
- [ ] `npm run build` passes cleanly before relying on it as a gate (Next.js lints the
  whole repo during build by default — pre-existing lint errors will fail it even if your
  policy is "lint touched files only" for day-to-day work)

## The three human gates

This workflow never proceeds past these without an explicit reply:

1. **Scope approval** — after reading an issue, before any branch or code exists.
2. **Escalation decisions** — whenever the implementer hits ambiguity, a schema change, a
   contract change, a new dependency, or the change grows too large.
3. **Findings triage** — after the review agents run, before any fix is applied.

It never commits to `main`, never force-pushes, and never merges a PR on its own.
