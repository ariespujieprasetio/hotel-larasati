# Hotel Larasati

Staff-only hotel management system with authentication and room inventory. Includes Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, Supabase SSR authentication, protected dashboard, and the initial PostgreSQL/RLS migration.

## Local setup

Use Node.js 22.13 or newer (Node 24 LTS recommended) and npm.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project. The latter must be the public anon key, never a service-role key.
4. Apply the versioned migration in `supabase/migrations/202609250001_initial_foundation.sql` using the Supabase CLI:
   - `npx supabase login`
   - `npx supabase link --project-ref YOUR_PROJECT_REF`
   - `npx supabase db push`
     Review the linked project before pushing. The repository does not include production credentials.
5. In Supabase Auth, enable email/password authentication and disable public signups. Set the Site URL to your deployment origin (locally `http://localhost:3000`). Configure password policy and Auth rate limits for your deployment.
6. Create a staff user in Supabase Authentication → Users with an administrator-set password and confirmed email. The database trigger creates an inactive FRONT_OFFICE profile. Never provide shared/default passwords.
7. Bootstrap the first owner using the SQL editor in your trusted Supabase project, replacing the UUID with that user's actual Auth ID:

```sql
update public.profiles
set full_name = 'Your owner name', role = 'OWNER', is_active = true
where id = 'REPLACE-WITH-AUTH-USER-UUID'::uuid;
```

8. Run `npm run dev`, visit `http://localhost:3000/login`, and sign in.

Without environment variables, the login page displays setup instructions and disables sign-in. Protected routes redirect to login. No demo login or authentication bypass exists.

## What is implemented

- Email/password staff login and local-session logout using Server Actions.
- Browser/server Supabase utilities and proxy session refresh.
- Server-side user verification plus active-profile checks; roles come from PostgreSQL, never user-editable auth metadata.
- Responsive sidebar, accessible mobile navigation, profile summary, and live hotel settings.
- Dashboard operational metrics explicitly show unavailable values until the relevant modules exist.
- OWNER, MANAGER, FRONT_OFFICE, HOUSEKEEPING, and FINANCE roles.
- Typed initial database schema, singleton hotel settings, timestamps, constraints, signup/email-sync triggers, and RLS.
- Form validation using Zod and React Hook Form, loading/error states, reusable shadcn components.

Room management is implemented. Guest/reservation/billing/housekeeping-task/report modules remain upcoming. Sidebar entries marked Soon are not links. Recharts and date-fns are installed for later phases. No service-role client exists.

## Files and responsibilities

- `src/app/(auth)`: login page and server actions.
- `src/app/(dashboard)`: authenticated layout and initial dashboard.
- `src/components/layout`: responsive staff navigation.
- `src/components/ui`: shadcn/ui components; `components.json` configures future additions.
- `src/lib/supabase`: typed cookie-aware clients and environment validation.
- `src/lib/services`: server-only authorization and hotel data access.
- `src/lib/validations`: shared input schemas.
- `src/types/database.ts`: Application database types; regenerate with Supabase CLI as the schema grows.
- `supabase/migrations`: reproducible schema and policies.
- `supabase/tests`: rollback-only authorization integration checks.

## Database permissions

| Data           | Read                                               | Update                 |
| -------------- | -------------------------------------------------- | ---------------------- |
| Own profile    | Authenticated account, including inactive accounts | Active OWNER only      |
| Other profiles | Active OWNER / MANAGER                             | Active OWNER only      |
| Hotel settings | All active staff                                   | Active OWNER / MANAGER |

The self-profile read allows the app to explain inactive access. Inactive staff cannot access settings or the dashboard. Clients cannot insert/delete profiles or settings, mutate profile IDs/email/timestamps, or self-assign roles. Supabase Auth creates profiles. Email changes sync from Auth. Owners administer profiles through trusted tooling until the user-management phase. Avoid deactivating the last owner; recover via trusted SQL if necessary. Database RLS remains authoritative even when requests bypass the UI.

Hotel defaults are IDR, check-in 14:00, check-out 12:00, and tax/service charge 0%. Confirm these with hotel management before operational use. Display dates use Asia/Jakarta.

## Validation

```sh
npm run typecheck
npm run lint
npm run build
npm run format:check
```

Run database integration checks only in an isolated development Supabase database after applying the migration:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/foundation.sql
```

The checks create temporary Auth fixtures inside a rolled-back transaction. Live authentication and database tests require a configured Supabase instance.

Manual acceptance checks:

- Unauthenticated `/dashboard` redirects to `/login`.
- Invalid credentials show a generic error; password is never logged.
- Inactive accounts cannot enter the dashboard; an active staff account can.
- Logout removes access to the dashboard.
- Test each role against the permission matrix, including direct Data API requests.
- Confirm mobile navigation opens/closes with keyboard focus and Escape.

Deployment needs environment variables, applied migrations, provisioned staff accounts, HTTPS, and Supabase Auth configuration. Builds do not require credentials and do not contact Supabase at build time.

## Room management update

Apply only `supabase/migrations/202609250002_room_management.sql` as a new SQL Editor query after the foundation migration. Do not rerun the first migration. Manual SQL Editor migrations require CLI migration-history reconciliation before a later `supabase db push`.

Open `/rooms`, add a room type, then add a room. OWNER/MANAGER manage inventory; FRONT_OFFICE reads it; HOUSEKEEPING performs DIRTY → CLEANING → CLEAN → INSPECTED → AVAILABLE. FINANCE has no room-operations access. Reserved/occupied states will be controlled by the future reservation module.

Includes room/type forms, board/table views, filters, pagination, soft deactivation, version-based stale-edit rejection, and database activity records. Room types cannot be deactivated while active rooms reference them. No demo inventory is inserted automatically.

Validation: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. After applying the migration, run the entire `supabase/tests/rooms.sql` against a disposable development database as postgres. Test fixtures roll back. Also test creating/editing rooms and types, duplicate numbers, status changes, and simultaneous edits in two browser tabs.
