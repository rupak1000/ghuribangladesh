# ADR-0005: Email-only sign-in for online accounts

**Status:** accepted

## Context

ADR-0004 introduced optional online accounts (map, marks, trips and settings stored in
PostgreSQL) and proposed that signing in on another device needs the email **and** a
server-generated recovery code, because the server cannot send email and an email address
alone proves nothing. The project owner decided against the recovery code, after being
told what that costs.

## Decision

Keep everything in ADR-0004 (anonymous-first accounts, optional email, session cookie,
`Account` / `Session` / `AccountState` tables, synced snapshot, no new dependencies)
**except** the recovery code:

- Signing in on another device uses the email only (`POST /api/account/login`, body
  `{ email }`). The email is **not verified**.
- The `Account.recoveryHash` column is dropped (migration
  `20261005180000_email_only_sign_in`). Account creation no longer returns a code.
- The app shows a plain note that anyone who knows an email can open that online map, and
  the account holds only travel data (no payments, no passwords).
- Login attempts stay rate-limited per IP; a wrong email returns "No online map found for
  that email".

## Consequences

- Anyone who knows or guesses a person's email can sign in as them and read, change or
  delete that person's online map. This is accepted for a travel-map app and is the
  owner's decision.
- Signing in on a new device no longer needs anything to be remembered or saved.
- Registered emails can be discovered by trying them (the response differs for unknown
  emails).
- When email delivery (SMTP) exists, the intended fix is an emailed one-time code before a
  session is opened; that will need its own ADR and will supersede this one.
