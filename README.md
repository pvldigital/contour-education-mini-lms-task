# Mini LMS

A small consultation-booking LMS built with Next.js App Router and Supabase. Students book consultations, manage their own bookings, and admins get a read-only view of every consultation.

## Features

- Email/password authentication with cookie-based Supabase sessions.
- Student dashboard containing only the signed-in student's consultations.
- Booking form on a separate page.
- Mark a consultation complete or incomplete.
- Reschedule or cancel a consultation with confirmation and state rules.
- Admin-only, read-only DataTable of all consultations, including student email.
- Shared Zod schemas and React Hook Form validation.
- Responsive, collapsible sidebar; booking and listing are separate routes.
- Supabase RLS plus server-side role guards and API role checks.
- Local-only seed data for quick development.

## Stack

- Next.js `16.4.6` App Router, React 19, TypeScript
- Supabase (`@supabase/ssr`, `supabase-js`, PostgreSQL, Auth)
- Tailwind CSS and shadcn/ui
- TanStack Table (`@tanstack/react-table@8.21.3`) with shadcn table primitives
- Zod, React Hook Form, and `@hookform/resolvers`
- pnpm; Supabase CLI `3.4.0`

## Architecture

```text
Browser
  ├─ Server Components: page shells, role guards, redirects
  ├─ Client views: fetch GET APIs, render DataTables/forms
  └─ API Route Handlers: role checks + Zod validation + Supabase queries
                                      │
                                      ▼
                         Supabase Postgres + RLS
```

- Reads use GET Route Handlers; mutations use `POST`/`PATCH` Route Handlers.
- Server pages call `requireStudent()` or `requireAdmin()` before rendering.
- RLS is the final row-level boundary, independent of the UI.
- Admin access is SELECT-only at both the API and database layers.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project, or Docker/OrbStack for the local Supabase stack

### Install

```bash
pnpm install
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
```

The legacy anon key also works with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; it is a public browser key, not a service-role secret. Never expose a service-role/secret key through `NEXT_PUBLIC_*`.

### Option A: hosted Supabase

1. Create a project in the Supabase dashboard.
2. Copy the Project URL and publishable/anon key into `.env.local`.
3. Apply migrations:

   ```bash
   pnpm db:link
   pnpm db:push
   ```

   `db:link` and `db:push` need CLI authentication. Set `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` in a gitignored env file when the CLI is not already logged in.

4. In Authentication > URL Configuration, set the Site URL and allow:
   - `/`
   - `/auth/confirm`
   - `/auth/update-password`

5. For email/password demos, either confirm the email or disable email confirmation in the hosted Auth settings.

6. Promote an admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@example.com';
   ```

### Option B: local Supabase

Requires Docker, Docker Desktop, or OrbStack.

```bash
pnpm db:start
pnpm db:reset   # applies migrations and the local seed
pnpm exec supabase status
```

Copy the local API URL and publishable/anon key from `supabase status` into `.env.local`, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Stop the local stack with:

```bash
pnpm db:stop
```

`pnpm db:reset` is destructive and local-only. Never point it at a hosted project.

#### Local seed accounts

All local seed accounts use the password `password123`:

| Email | Role |
|---|---|
| `admin@example.com` | admin |
| `student@example.com` | student |
| `student2@example.com` | student |

The seed creates scheduled, completed, and cancelled rows so the tables and actions can be exercised immediately. These credentials and data are for local development only.

#### Local Supabase notes

- If the CLI cannot write to `~/.supabase`, set `SUPABASE_HOME=$PWD/.supabase-home` for CLI commands.
- If Docker cannot pull `postgrest/postgrest:v17.1` (the linked project currently uses PostgREST v17.1, which is not on Docker Hub under that name), pull `supabase/postgrest:v17.1-middleware` and retag it as `postgrest/postgrest:v17.1`.
- `supabase/config.jsonc` points the seed at `supabase/seed.sql`. The seed is not applied by a normal hosted `db push`.

### Migration state

All five migrations are applied to the linked hosted project. `pnpm db:migrations` matches local and remote history, and hosted advisors report no issues. Temporary remote QA users and consultations were removed after verification. Do not reset or overwrite remote history.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Next.js |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | ESLint |
| `pnpm db:link` | Link this checkout to a Supabase project |
| `pnpm db:push` | Apply migrations to the linked remote project |
| `pnpm db:migrations` | Compare local and remote migration history |
| `pnpm db:advisors` | Run hosted security/performance advisors |
| `pnpm db:start` | Start local Supabase |
| `pnpm db:stop` | Stop local Supabase |
| `pnpm db:reset` | Reset local DB, apply migrations, and seed |

## Database

### Tables

`public.profiles`

| Column | Notes |
|---|---|
| `id` | UUID PK, references `auth.users(id)` on delete cascade |
| `email` | text, not null |
| `role` | `student` or `admin`; default `student` |
| `created_at` | timestamptz, default `now()` |

`public.consultations`

| Column | Notes |
|---|---|
| `id` | UUID PK, default `gen_random_uuid()` |
| `student_id` | UUID, references `profiles(id)` on delete cascade |
| `first_name`, `last_name` | trimmed, 1–100 characters |
| `reason` | trimmed, 1–2000 characters |
| `scheduled_at` | timestamptz |
| `status` | `scheduled`, `completed`, or `cancelled`; default `scheduled` |
| `created_at`, `updated_at` | timestamptz |

Triggers create a profile after an `auth.users` insert and maintain `updated_at`. Indexes cover `(student_id, scheduled_at)` and `scheduled_at`.

### Status lifecycle

| Current | Allowed |
|---|---|
| `scheduled` | mark complete, reschedule, cancel |
| `completed` | mark incomplete; no reschedule or cancel |
| `cancelled` | terminal; no updates |

`status` is the single source of truth. There is no separate `completed` boolean.

### Migration history

```text
20261125233030_create_lms_schema.sql
20261125235253_restrict_trigger_function_execution.sql
20261126042103_restrict_admin_consultation_writes.sql
20261126042934_revoke_trigger_function_api_execute.sql
20261126210906_consolidate_consultation_status.sql
```

The last migration backfills `completed=true` rows to `status='completed'` and drops the boolean. Cancelled rows win over a stale completed flag because cancellation is terminal.

### RLS and roles

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | own row or admin | none | none | none |
| `consultations` | own rows or admin | own `student_id` | own rows, preserving `student_id` | none |

- `private.is_admin()` checks the current user's `profiles.role`.
- Admin mutation requests are rejected by the API and by RLS.
- Role changes happen through SQL/service role, never through user-editable metadata.
- No DELETE policy: cancellation is a status update.

### Local seed

`supabase/seed.sql` is local-only. It inserts demo auth users, profiles, and consultations using fixed UUIDs and `on conflict do nothing`. It is intentionally coupled to the local Supabase Auth schema and must not be run against a hosted project.

## API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/consultations` | student | Own consultations, ascending by scheduled time |
| `GET` | `/api/admin/consultations` | admin | All consultations with student email, descending |
| `POST` | `/api/consultations` | student | Create a consultation |
| `PATCH` | `/api/consultations/[id]` | student/owner | Complete, uncomplete, reschedule, or cancel |

`PATCH` accepts exactly one of:

```json
{ "status": "completed" }
```

```json
{ "status": "scheduled" }
```

```json
{ "status": "cancelled" }
```

```json
{ "scheduledAt": "2026-12-01T09:00:00.000Z" }
```

Responses use `{ consultation }` or `{ consultations }`; errors use `{ error: string }`.

| Status | Meaning |
|---|---|
| 400 | Invalid fields, invalid/past datetime, invalid status, or more than one update field |
| 401 | No authenticated user |
| 403 | Wrong role for the endpoint |
| 404 | Consultation missing or not owned |
| 409 | Invalid state transition |
| 500 | Database failure |

Both list endpoints are currently unpaginated. Rows follow API order; column sorting is intentionally not exposed. Pagination is the next planned improvement.

## Validation

- Zod schemas live in `lib/schemas/consultation.ts` and `lib/schemas/auth.ts`.
- Consultation schemas are shared by the API parsers and the booking/reschedule forms.
- React Hook Form provides field state and errors in the browser; `noValidate` lets Zod handle validation consistently.
- Server validation is authoritative. API requests are parsed again even when the client already validated.
- Auth form validation is client-side UX only; Supabase Auth remains authoritative. Passwords require at least 6 characters, matching Supabase's default minimum.

## Security

- Sessions use `@supabase/ssr` cookies with explicit `SameSite=Lax`, `Secure` when the Supabase URL is HTTPS, and a 7-day lifetime for browser and server writes; server code verifies claims through `getClaims()`.
- Authorization uses `profiles.role`, never user-editable metadata.
- RLS enforces ownership and admin SELECT access.
- Server page guards and API role checks are additional layers, not replacements for RLS.
- Admin access is read-only.
- The app uses only the public publishable/anon key. No service-role key is exposed to the browser.
- API routes return 401 for unauthenticated requests and 404 for non-owned consultations so another student's rows are not revealed.
- Auth redirects are resolved against a fixed origin before use; external and backslash-normalized paths are rejected.
- [next.config.ts](next.config.ts) sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, production HSTS, and disables `X-Powered-By`. API responses are marked `private, no-store`.
- The proxy creates a per-request nonce and applies a CSP with `strict-dynamic` scripts, `frame-ancestors 'none'`, and a Supabase-only `connect-src`. `style-src` permits inline styles because Radix/Next use them; scripts do not permit `unsafe-inline`.
- Pages are dynamically rendered so Next.js can attach the CSP nonce to its scripts.

### Known `getClaims()` warning

Some `supabase-js` versions log an “insecure user object” warning when `getClaims()` reads the cookie-backed session. The call verifies the JWT and is the intended server-side check. Do not switch to unverified `getSession()` or weaken auth to silence it.

## Design decisions

### API-first reads and writes

Reads and mutations use Route Handlers. The initial student/admin pages queried directly in Server Components; they were moved to GET APIs for consistency, one response contract, and upcoming pagination/filtering. The trade-off is an extra client fetch and explicit loading/error states.

### Single status field

The original schema used `status` (`scheduled`/`cancelled`) plus a `completed` boolean. That allowed four combinations for three valid states and could represent `cancelled + completed`. The product rules make cancellation terminal and do not need completion independent of lifecycle, so the boolean was redundant. Migration `20261126210906_consolidate_consultation_status.sql` backfills and removes it.

If a future requirement needs history such as “completed, then cancelled,” use an event/audit table rather than reintroducing a contradictory boolean.

### DataTable

Both listings use the shadcn DataTable pattern and TanStack Table. `@tanstack/react-table` is pinned to `8.21.3` because the v9 API differs. Tables show fixed API order; sorting was removed. Pagination can be added client-side or through server-side `limit`/`offset`.

### Validation and seed

Zod + React Hook Form centralise form rules and field errors; the API reuses the consultation schemas. The seed is local-only and intentionally inserts into the local Auth schema; it is not a production fixture.

## Assumptions and limitations

- One role per user; one student per consultation.
- No organisations, notifications, hard deletes, filters, or pagination yet.
- Storage is UTC; the UI displays the viewer's local time and interprets `datetime-local` inputs in the browser timezone.
- No automated test suite; verification uses lint/build, SQL/API checks, and the manual matrix below.
- `cacheComponents` is disabled because authenticated pages read cookies; enabling it requires Suspense boundaries around session reads.
- Admin list reads all rows; this is acceptable for a mini app but should be paginated as data grows.
- The local seed is coupled to the local Auth schema and must remain local-only.
- The session cookie is not `HttpOnly` because browser auth needs to read it; CSP limits XSS impact. Add API rate limiting as a follow-up.
- The local PostgREST retag workaround is environment-specific.

## Implementation summary

1. Database: profiles/consultations schema, triggers, indexes, RLS, role helper, migration hardening.
2. Auth shell: responsive collapsible sidebar, role-aware navigation, redirects, accessible auth pages.
3. Booking: separate booking page, validated POST API, dashboard list.
4. Management: status updates, reschedule, cancel, ownership and transition rules.
5. Admin: read-only DataTable of all consultations; GET APIs for both lists.
6. Validation/quality: single status model, Zod/React Hook Form, shadcn DataTables, seed, README and cleanup.

## Verification

```bash
pnpm lint
pnpm build
```

### Manual E2E matrix

| # | Flow | Expected |
|---|---|---|
| 1 | Sign up | Account created; confirmation path or session handled |
| 2 | Log in / log out | Routes to `/dashboard`; logout returns to login |
| 3 | Student dashboard | Only own consultations |
| 4 | Book consultation | Four fields; appears on dashboard; invalid/past rejected |
| 5 | Complete/incomplete | Status updates and persists |
| 6 | Reschedule | Future time saved and displayed |
| 7 | Cancel | Status becomes cancelled; actions disappear |
| 8 | Student isolation | Student B cannot read or mutate Student A's row |
| 9 | Admin view | All consultations visible; no mutation controls |
| 10 | Student admin route | Redirected away |
| 11 | API auth | No session 401; non-owner 404; wrong role 403 |
| 12 | Quality | Lint/build pass; advisors pass |

## Project structure

```text
app/(app)/layout.tsx              authenticated shell and sidebar
app/(app)/dashboard/page.tsx      student consultation DataTable
app/(app)/consultations/new/      separate booking page
app/(app)/admin/page.tsx          admin-only read-only DataTable
app/api/consultations/route.ts    GET own list; POST create
app/api/admin/consultations/...   GET all (admin)
app/api/consultations/[id]/       PATCH status/reschedule
app/auth/*                        auth pages and email confirmation
components/*-table.tsx            shadcn DataTables
components/*-form.tsx             React Hook Form forms
lib/schemas/*                     shared Zod schemas
lib/security/csp.ts               per-request nonce CSP
lib/supabase/browser-cookies.ts   7-day browser session cookies
lib/auth.ts                       session/profile/admin guards
lib/supabase/*                    SSR/browser clients and proxy refresh
supabase/migrations/              schema and security migrations
supabase/seed.sql                 local-only demo data
```

## Future work

- Pagination/filtering for both consultation lists.
- Automated auth/RLS/API tests and a CI quality gate.
- Request-level caching of session/profile lookups.
- Optional audit/event history for consultation state changes.

## License

Private assessment project.
