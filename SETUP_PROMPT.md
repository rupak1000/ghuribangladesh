Paste the block below into a fresh Claude Code session, in the root of a new or existing
Next.js + Prisma project. If you've already copied this template's `.claude/` folder and
`CLAUDE.md` into the project, say that up front so Claude Code adapts them instead of
starting from scratch.

---

## Context
- Existing Next.js (App Router) + TypeScript repo. ORM/DB: Prisma + Postgres.
- Read this repo first and base everything on what's actually here — don't assume
  conventions from another project. Confirm package manager, test framework, and
  whether ESLint/Playwright are already configured before proposing anything.
- I work solo, one task at a time. Do NOT use git worktrees — single working copy,
  one branch at a time.
- GitHub issues are the source of truth for tasks. gh CLI is installed and authenticated.

## Step 0 — Tooling audit (do this first, every time)
Check and report on: package manager (lockfile), test framework (Vitest/Jest),
ESLint config, Playwright/e2e setup, Prisma migrations folder state, and whether
`npm run build` currently passes cleanly. If anything critical is missing (no test
framework, no lint, no e2e), propose adding it as an explicit Step 0 task, get my
approval, then set it up before moving to the main deliverable. If Postgres is on a
VPS I manage, remind me to check: CREATEDB privilege, GRANT ALL ON SCHEMA public
(needed on PG15+, and separately on template1 if shadow-database migrations apply),
and that the role's rolconfig isn't silently redirecting to another role.

## Goal
Set up Claude Code in this repo (agents, project instructions, permissions, entry
points) so the workflow below runs reliably. If a `.claude/` folder and `CLAUDE.md`
were already copied in from a template, read them, verify they actually match this
repo, and correct anything that doesn't — don't assume a copied file is accurate.

## Workflow I want
1. I give you an issue number and nothing else.
2. Read the issue with gh, restate scope in 5-10 lines, list open questions, WAIT
   for my approval. Create the branch only after I approve.
3. Hand the approved scope to an *implementer* agent, which writes code + tests
   (unit and, for user-facing flows, e2e via Playwright).
4. The implementer STOPS and reports back instead of guessing whenever:
   - requirements are ambiguous or the issue contradicts the code
   - it needs a new dependency, an env var, a DB schema change, or a migration
   - it would touch a public API contract (route handler, Server Action, shared type)
     or change existing behaviour
   - tests fail for a reason it can't fix in 3 attempts
   - the change would exceed roughly 10 files / 300 lines
   Escalation format: what it tried, why blocked, 2-3 options with a recommendation.
   After I decide, it resumes with that decision recorded.
5. When done: tests, lint, typecheck, e2e (if relevant), and build must all pass
   locally. Then commit (conventional commits), push, open a DRAFT PR with gh
   linking the issue.
6. Run the *review* agents against the PR diff (not the whole repo). Reviewers are
   read-only: no editing, committing, or pushing.
7. Collect findings into one table: severity (blocker/should/nit), file:line,
   what's wrong, suggested fix. No praise, no restating code, no nits unless flagged.
   WAIT for me to triage each item as fix/won't-fix/discuss.
8. Only approved items go back to the implementer. Repeat 5-7 until clean, then take
   the PR out of draft.

## Review agents
Propose 4-6 scoped reviewers for a Next.js App Router + Prisma service. Cover at
minimum: App Router architecture (server/client boundaries, route structure,
Route Handler vs Server Action justification), security (authn/authz, input
validation via Zod or similar, secrets, no server-only data leaking to client),
data layer (migration reversibility, transactions, N+1), API/contract changes,
and test quality (unit + e2e coverage of new user-facing flows, no tautological
assertions).

## Deliverables
- .claude/agents/*.md — frontmatter (name, description, tools, model). Minimum
  tools per agent; reviewers get Read/Grep/Glob only.
- CLAUDE.md — stack, conventions, folder structure, exact commands, definition of
  done, never-do list.
- .claude/skills/dev-issue/SKILL.md — entry point taking an issue number, driving
  the full loop with every "wait" as a real stop.
- .claude/settings.json — pre-allow safe commands (test/lint/typecheck/build/e2e,
  gh issue view, gh pr create); deny force-push, push to main, npm audit fix --force,
  and destructive migration edits.
- Optional hooks only if there's a concrete gap the double-check in the skill won't
  catch — don't add speculative hooks.
- README section: how to run /dev-issue <n>, and exactly where the human gates are.

## Hard rules
Never commit to main. Never force-push or rewrite pushed history. Never add a
dependency, delete a migration, edit CI config, or run npm audit fix --force
without asking me first.

## Before you write anything
Ask your clarifying questions in one batch. Then show me the plan and file list,
and wait for my go-ahead.

---

**Note:** if this repo has little or no documentation, don't try to write it as part of
this setup. Once the above is in place, separately invoke the `init-docs` skill (already
included in this template) to derive `README.md` and `docs/` from the actual code, in its
own two-phase pass — that's a bigger job and deserves its own review cycle, not something
to rush through here.
