# Mini LMS

A small consultation-booking LMS built with Next.js App Router, TypeScript, and Supabase. Used the recommended next-app create with supabase example as the starting point.

## Special setup instructions

### Prerequisites

- Node.js 20+
- pnpm
- A Supabase project, or Docker/OrbStack for the local Supabase stack

Install dependencies and create the environment file:

```bash
pnpm install
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
```

Use the publishable/anon key only. Never expose a service-role key through a `NEXT_PUBLIC_*` variable.

### Hosted Supabase

1. Apply the six migrations:

   ```bash
   pnpm db:remote:link
   pnpm db:remote:push
   ```

   `db:remote:link` and `db:remote:push` require a Supabase access token and database password. Keep them in a gitignored env file.

2. In Supabase Authentication > URL Configuration, set the Site URL and allow:
   - `/`
   - `/auth/confirm`
   - `/auth/update-password`

3. Configure email confirmation for the demo, or confirm test accounts manually.

4. Promote an admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@example.com';
   ```

### Local Supabase

Requires OrbStack, Docker Desktop, or another Docker runtime.

```bash
pnpm db:local:start
pnpm db:local:stop
pnpm db:local:reset
pnpm exec supabase status
```

Copy the local API URL and publishable/anon key from `supabase status` into `.env.local`, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Stop the stack with `pnpm db:local:stop`.

Local seed accounts use password `password123`:

Admin account email: admin@example.com
Student account email: student@example.com
Student account email: student2@example.com

The seed also creates five consultations covering scheduled, completed, and cancelled states. The seed is local-only and is never applied to the hosted project.

For the automated suites, copy the local values into the test environment and reset before running:

```bash
pnpm db:local:start
pnpm db:local:reset
pnpm exec supabase status -o env
export TEST_SUPABASE_URL=http://127.0.0.1:54321
export TEST_SUPABASE_ANON_KEY=<local-anon-key>
export TEST_BASE_URL=http://127.0.0.1:3100

pnpm test:unit
pnpm test:rls
pnpm test:e2e
```

`pnpm test:e2e` builds and starts a production server on port 3100. `tests/` are intentionally local-only; they refuse non-local Supabase URLs.

Local environment notes:

- If the CLI cannot write `~/.supabase`, prefix commands with `SUPABASE_HOME=$PWD/.supabase-home`.
- If Docker cannot pull `postgrest/postgrest:v17.1`, pull `supabase/postgrest:v17.1-middleware` and retag it as `postgrest/postgrest:v17.1`.

### Commands

`pnpm dev` - Start Next.js
`pnpm build` - Production build
`pnpm start`- Start the production server
`pnpm lint` - ESLint
`pnpm db:remote:link` - Link the Supabase project
`pnpm db:remote:push` - Apply migrations to the linked remote project
`pnpm db:remote:migrations` - Compare local/remote migration history
`pnpm db:remote:advisors` - Run hosted security/performance advisors
`pnpm db:local:start` - Start local Supabase
`pnpm db:local:stop` - Stop local Supabase
`pnpm db:local:reset` - Reset local DB, apply migrations, and seed

## Justifications and assumptions

### API and data flow

- Initial list pages are server-rendered through shared query helpers in `lib/queries/consultations.ts`; GET APIs remain available for refresh and pagination.
- This hybrid avoids an initial client-fetch waterfall while keeping one query implementation for page and API consumers.
- List pagination is offset-based with exact counts and stable `(scheduled_at, id)` ordering.
- No filtering/search is implemented yet.

### Roles and RLS

- Authorization uses `profiles.role`, never user-editable metadata.
- RLS is the final row boundary; server guards and API checks are additional defence.
- Students can select, insert, and update only their own consultations.
- Admins can select all consultations but cannot update them; admin write restrictions are enforced in the API and in RLS.
- There is no DELETE policy. Cancellation is a soft status update.

### Single status model

The original schema used `status` (`scheduled`/`cancelled`) plus a `completed` boolean. That represented four combinations for three valid states and could store contradictory data such as `cancelled + completed`.

The current schema uses one status:

```text
scheduled/completed/cancelled
```

Migration `20261126210906_consolidate_consultation_status.sql` backfills `completed=true` to `status='completed'`, adds the new check constraint, and drops the boolean. Cancelled remains terminal; completed rows cannot be rescheduled or cancelled. The transition update is conditional on the status that was read, so concurrent conflicting updates return `409` instead of both succeeding.

### Validation

- Supabase database types are generated from the linked schema into `lib/supabase/database.types.ts` with `pnpm db:remote:types`; both browser and server clients use the `Database` type.
- Zod schemas in `lib/schemas/` are shared by API parsers and client forms.
- React Hook Form provides field state/errors in the browser.
- The server always revalidates requests; browser validation is UX only.
- Auth forms are client-side UX; Supabase Auth remains authoritative. Passwords require at least 6 characters.

### UI

- shadcn/ui + Tailwind are used throughout.
- Both consultation lists use the shadcn DataTable pattern with TanStack Table. Sorting is not exposed; rows follow API order.
- shadcn Pagination, Sheet, and Skeleton replace custom pagination controls, the mobile dialog/focus trap, and custom skeleton divs.
- The sidebar remains a tailored collapsible component; status badges and data/query controllers stay domain-specific.

### Security

- `getClaims()` verifies the session server-side; do not replace it with unverified session data.
- Security headers include frame denial, nosniff, referrer/permissions policies, production HSTS, and a nonce-based CSP.
- Session cookies use `SameSite=Lax`, HTTPS-only `Secure`, and a 7-day lifetime. They are not `HttpOnly` because browser-side Supabase auth must read them; the CSP reduces XSS impact.
- API errors are generic and ownership checks return `404` for another student’s row.
- API rate limiting and data retention/deletion workflows are not implemented; they are known production follow-ups.
- `cacheComponents` is disabled because authenticated pages read cookies. All pages are dynamic to support CSP nonces.

### Assumptions

- One role per user and one student per consultation.
- No organisations, notifications, hard deletes, or filters.
- The datetime is stored in UTC. The UI displays the users local time and interprets `datetime-local` input in the browser timezone.
- The local seed inserts into the local Supabase Auth schema and must remain local-only.
- Unit, RLS, and two Playwright smoke suites run locally and in CI. Further tests is recommended but overkill for this assignment.
- The `getClaims()` “insecure user object” warning is a known false positive.

## Summary of the overall implementation

### Stack and structure

- Next.js `16.4.6`, React 19, TypeScript, Tailwind, shadcn/ui
- Supabase Auth/Postgres with `@supabase/ssr` and `supabase-js`
- Zod, React Hook Form, and `@hookform/resolvers`
- TanStack Table with shadcn DataTable
- Supabase CLI `3.4.0` and six migrations

Key paths:

```text
app/(app)/layout.tsx                        authenticated shell and sidebar
app/(app)/dashboard/page.tsx                student consultation list
app/(app)/consultations/new/                separate booking page
app/(app)/admin/consultations/page.tsx      admin-only read-only consultations list
app/api/consultations/route.ts              GET own list; POST create
app/api/admin/consultations/...             GET all consultations (admin)
app/api/consultations/[id]/                 PATCH status/reschedule
app/auth/*                                  auth pages and confirmation
lib/queries/*                               shared server list queries
lib/pagination/*                            page metadata/range helpers
lib/schemas/*                               shared Zod schemas
lib/auth.ts                                 session/profile/role guards
lib/security/csp.ts                         per-request nonce CSP
components/*-table.tsx                      student/admin DataTables
components/*-form.tsx                       React Hook Form forms
supabase/migrations/                        schema, indexes, triggers, RLS
supabase/seed.sql                           local-only demo data
```

### Features

- Email/password sign-up, login, logout, forgot/update password.
- Role-aware redirects: admins to `/admin/consultations`, students to `/dashboard`.
- Students create, list, complete/incomplete, reschedule, and cancel their own consultations.
- Admin read-only view of all consultations with student email.
- Paginated lists with page/total metadata and stable ordering.
- Local seed for three accounts and five consultations.

### API

`GET` - `/api/consultations?page=&pageSize=` - Student, own rows
`GET` - `/api/admin/consultations?page=&pageSize=` - Admin, all rows
`POST` - `/api/consultations` - Student, create
`PATCH` - `/api/consultations/[id]` - Owner, status or reschedule

Pagination defaults to 10 rows, caps at 50 per page, and clamps page numbers to 10,000. Responses are `{ consultation }` / `{ consultations, pagination }`; errors are `{ error: string }` with `400`, `401`, `403`, `404`, `409`, or `500`.

### Verification

```bash
pnpm lint
pnpm build
pnpm test:unit
pnpm test:rls
pnpm test:e2e
pnpm db:remote:migrations
pnpm db:remote:advisors
```

Automated coverage includes validation/pagination units, RLS ownership and admin read-only rules, the student booking/manage flow, admin read-only controls, role redirects, and student rejection by the admin API.
