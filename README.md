# Hotel Larasati

Staff-only hotel management system with authentication, room inventory, guest management, and reservations. Includes Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, Supabase SSR authentication, protected dashboard, and the initial PostgreSQL/RLS migration.

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

Room, guest, reservation, check-in, room billing, payment recording and checkout are implemented. Housekeeping assignments, notes and work history are also implemented. Extra charges, refunds, maintenance-task and report modules remain upcoming. Sidebar entries marked Soon are not links. Recharts and date-fns are installed for later phases. A separate server-only admin client is used only to create staff Auth accounts; application data writes still use the authenticated staff session.

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

The self-profile read allows the app to explain inactive access. Inactive staff cannot access settings or the dashboard. Clients cannot insert/delete profiles or settings, mutate profile IDs/email/timestamps, or self-assign roles. Supabase Auth creates profiles. Email changes sync from Auth. Owners administer roles and active status from Users after the staff-management migration. The staff-management migration prevents deactivating, demoting or deleting the last active owner. Database RLS remains authoritative even when requests bypass the UI.

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

Open `/rooms`, add a room type, then add a room. OWNER/MANAGER manage inventory; FRONT_OFFICE reads it; HOUSEKEEPING performs DIRTY → CLEANING → CLEAN → INSPECTED → AVAILABLE. FINANCE has no room-operations access. Occupied status is controlled by the check-in workflow. Future bookings do not change physical room readiness.

Includes room/type forms, board/table views, filters, pagination, soft deactivation, version-based stale-edit rejection, and database activity records. Room types cannot be deactivated while active rooms reference them. No demo inventory is inserted automatically.

Validation: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. After applying the migration, run the entire `supabase/tests/rooms.sql` against a disposable development database as postgres. Test fixtures roll back. Also test creating/editing rooms and types, duplicate numbers, status changes, and simultaneous edits in two browser tabs.

## Guest management

Apply only `supabase/migrations/202609270001_guest_management.sql` as a new SQL Editor query. Do not rerun previous migrations. Then open **Guests → Guest list**, add a guest, edit their details, and try the search fields (name, phone, identity number, guest code).

OWNER, MANAGER and FRONT_OFFICE can read/create/edit/deactivate guests. HOUSEKEEPING, FINANCE, inactive staff and anonymous users cannot access guest records. Both server authorization and database RLS enforce this. Guest codes are database-generated and immutable; identity type/number pairs are unique, including inactive records. Empty identity numbers are allowed until registration is completed. KTP numbers, when supplied, must have 16 digits. Dates use the Jakarta calendar. Phone and email may be shared between guests and are not unique.

Updates use a version check to reject stale form submissions. Deactivation keeps the record; no client deletion is allowed. Activity captures the actor, action and changed field names without copying personal information. Booking history is shown after the reservation migration; stay/payment history awaits the check-in and billing modules. No production guest fixtures are inserted by the migration.

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. On a disposable development Supabase database, run the entire `supabase/tests/guests.sql` as postgres after applying the migration. Fixtures roll back; generated codes can have gaps because PostgreSQL sequences do not roll back.

Manual checks: create a guest with just a name; add identity/contact details; reject duplicate identity; search each field; edit from two browser tabs and reject the stale save; deactivate/reactivate; verify the activity list; verify denied access using HOUSEKEEPING and FINANCE accounts.

## Reservations

Apply only `supabase/migrations/202609270002_reservations.sql` after the earlier migrations. It installs the `btree_gist` extension and adds reservations, activity, RLS and transactional RPCs. Do not rerun previous migrations.

Open **Reservations → New reservation**, or use **New reservation** on a guest's detail page. Search/select an active guest, set dates and room type, enter adults/children, then click **Check availability & price**. Select a room or let the database allocate one. Review the quote before saving. Adding a new guest opens a separate tab so the draft is preserved; search again after creating them.

Rules:

- Pending and confirmed reservations both hold inventory. Each saved booking gets a real room allocation, even when the user selects automatic assignment.
- Checkout is an exclusive boundary: a booking ending September 27 does not block another starting September 27. Maximum stay: 365 nights.
- Active reservations cannot overlap the same room; a PostgreSQL exclusion constraint enforces this in addition to transactional allocation.
- Inactive, maintenance, out-of-order, occupied and manually reserved rooms cannot be newly assigned. Dirty/cleaning rooms may be booked but must be cleaned before the check-in workflow permits entry.
- Room board status continues to describe current readiness. Future bookings do not mark today's room as reserved.
- OWNER/MANAGER/FRONT_OFFICE can manage reservations. Only OWNER/MANAGER can change discounts; front office may preserve an existing approved discount.
- Prices are calculated in PostgreSQL: nightly rate × nights − discount; service charge on that net amount; tax on net plus service. Money is rounded to two decimal places. Final amounts and currency are rechecked against the reviewed quote on save.
- Rates/tax/currency are snapshotted. Editing dates, room type or discount reprices using current settings; metadata-only edits retain the saved price.
- Versions reject stale edits. Confirm/cancel/no-show are explicit actions; cancellation/no-show require reasons. No-show is allowed on or after arrival. Closed reservations cannot be reopened in this phase.
- Reassign or cancel active bookings before deactivating their guest, changing/blocking their room, or reducing room-type capacity below booked party sizes.
- Direct client writes to reservation tables are forbidden. RPCs recheck active staff roles; audit records are written atomically.

Creating a reservation does not check a guest in or record a payment. Room folios open at check-in after applying the billing migration.

`npm test` now runs a local PGlite PostgreSQL harness with a minimal Supabase Auth fixture. It applies all migrations and runs all eight SQL suites, including exclusion constraints, quote tampering, rate snapshots, sold-out inventory, same-day turnover, role denial and stale edits. This is a development test dependency only; the application still uses Supabase. The harness does not simulate Supabase's hosted Auth service or multi-session concurrency/load. The exclusion constraint provides the database overlap guarantee.

After migration, run the entire `supabase/tests/reservations.sql` on a disposable development Supabase database as postgres. Fixtures roll back. For a manual concurrency check, use two staff sessions to select the same room/dates and submit both; exactly one should succeed. Also test auto-assignment when the room type is sold out, cancellation followed by rebooking, and the guest's booking history.

## Check-in and in-house guests

Apply only `supabase/migrations/202609270003_check_in.sql` after the reservation migration. No earlier migration needs to be rerun.

Open **Check-in**, review a confirmed reservation, verify the guest and room assignment, tick the verification checkbox, and select **Check in guest**. Pending reservations must be confirmed first. Successful check-in opens **In-house guests** and changes the room to OCCUPIED.

- OWNER, MANAGER and FRONT_OFFICE may check in and read stays. HOUSEKEEPING, FINANCE, inactive accounts and anonymous users cannot.
- Check-in is allowed on or after the booked arrival date and strictly before the departure date, using Asia/Jakarta. Same-day early arrival is allowed when the room is ready; there is no check-in-hour restriction or automatic extra fee. Earlier calendar dates require editing the reservation first.
- Only active AVAILABLE or INSPECTED rooms qualify. CLEAN rooms must complete inspection first. Guest and room type must remain active.
- The RPC atomically inserts a stay, changes the reservation to CHECKED_IN, updates the room to OCCUPIED, and records existing reservation/room audits. It preserves the agreed booking prices and dates, including late arrivals.
- A unique open-stay index prevents simultaneous physical occupants even after the scheduled departure date. Repeated requests and stale booking versions are rejected. There are no direct client stay writes or manual occupied-room releases.
- In-house guests shows actual arrival time and scheduled departure, including overdue departures. Lists paginate 20 records at a time. Checkout and room folios become available after the billing migration below. Room moves are not yet implemented; check-in does not record a payment.

Run `npm test` for the local PostgreSQL suite, or run the entire `supabase/tests/check_in.sql` in a disposable development database as postgres. Fixtures roll back. Tests cover pending/future/stale/duplicate check-ins, dirty-room rejection and rollback, successful arrival and audit, role restrictions, and a prior guest overstaying. The local harness does not simulate concurrent sessions; for hosted acceptance, submit the same check-in from two staff sessions and verify only one stay exists.

## Room billing, payments and checkout

Apply only `supabase/migrations/202609270004_billing_checkout.sql`. It creates a room folio for every existing CHECKED_IN reservation with the agreed charges and a zero paid amount. Future check-ins create the same folio atomically. No payment is inferred from a reservation.

Open **Check-out** or **Folios / Billing**, review the room bill, record money already received, and complete checkout when the balance is zero. The **Payments** menu shows the recorded receipts and reversal entries. Partial payments are supported using CASH, BANK_TRANSFER, CARD or QRIS. Non-cash entries require a transaction reference. These are accounting records only: the application does not initiate or verify bank/card/QRIS transfers.

- Folios snapshot the guest name, room number, reservation number, currency and agreed room charges (including discount, service and tax). FINANCE can read bills/payments and record payments without gaining guest identity/contact or reservation access.
- OWNER/MANAGER/FRONT_OFFICE/FINANCE record payments. Only OWNER/MANAGER reverse an incorrect entry, with a required reason. Reversal creates an additional record and retains the original; it does not issue a refund. Closed bills cannot be changed.
- Amounts and balances use PostgreSQL numeric arithmetic. Zero/negative payments, sub-cent amounts and overpayments are rejected. Direct client writes to bills/payments are forbidden.
- Each form submission has a request UUID. Retrying the same payment with the same key and details is idempotent, including after checkout. Changed details with a reused key are rejected. The browser preserves the key for retries in the same mounted form; after reloading or switching devices, inspect payment history before recording again.
- Only OWNER/MANAGER/FRONT_OFFICE can check out. The RPC locks the reservation, bill and inventory, checks the reviewed bill version and zero balance, closes the stay/bill, marks the reservation CHECKED_OUT, and makes the room DIRTY in one transaction. Checkout staff/time and reservation/room audits are retained.
- The agreed room total remains unchanged for early or late departure. This phase has no automatic late fees, extra services, pre-arrival deposits, refunds, invoice PDF or room moves. The checkout form explicitly asks staff to review this final bill.
- Rooms then follow DIRTY -> CLEANING -> CLEAN -> INSPECTED -> AVAILABLE. The room cannot be checked in again while DIRTY.
- Closed bills remain accessible using the Closed/All filter. Lists paginate 20 records; a bill displays its latest 200 ledger entries, while Payments provides the full paginated history.

Validation: `npm test` includes the eight PostgreSQL rollback suites, payment input tests, and a separate upgrade test for an already checked-in guest. Run the whole `supabase/tests/billing_checkout.sql` on a disposable development database as postgres for hosted database checks. Also run typecheck, lint, format:check and build.

Manual acceptance: try checkout with a balance; record a partial payment; reverse it as OWNER/MANAGER; settle the remaining amount; complete checkout; verify the guest disappears from In-house, reservation is CHECKED_OUT, room is DIRTY, and closed bill cannot receive new payments. Verify FINANCE cannot check out or reverse entries. For concurrency acceptance on hosted Supabase, submit competing payments from two sessions and confirm the total never exceeds the bill, then test checkout against a simultaneous reversal. Local PGlite tests exercise constraints and stale-version handling, not multi-session load.

## Housekeeping jobs

Apply only `supabase/migrations/202609270005_housekeeping.sql`. Existing active DIRTY, CLEANING, CLEAN and INSPECTED rooms receive a job at their current stage; occupied/available rooms do not. No past cleaning work is fabricated.

Open **Housekeeping**, filter by room, stage or assignment, and open a job. OWNER/MANAGER assign active HOUSEKEEPING staff or leave jobs unassigned. A housekeeping staff member can take an unassigned job, or progress it to claim it while working. Management can also perform cleaning steps without an assigned cleaner.

- Room status remains authoritative: DIRTY -> CLEANING -> CLEAN -> INSPECTED -> AVAILABLE. Housekeeping staff retain their existing inspection permission; a separate supervisor approval step is not imposed.
- Staff cannot work on another cleaner's assigned job, including through direct room updates. Management can reassign the job. Deactivated assignees must be reassigned by management.
- Notes are appended to job history with actor/time. Changes from Rooms also synchronize task status. Version checks reject stale task submissions.
- Checkout creates a new DIRTY job automatically. AVAILABLE completes the job; check-in from INSPECTED also completes it. Blocking/deactivating the room cancels the open job. A subsequent cleaning cycle gets a new job and retains old history.
- One open job per room is enforced in PostgreSQL. Direct task/history writes are denied; transactional RPCs and room triggers apply changes.
- OWNER/MANAGER/HOUSEKEEPING/FRONT_OFFICE can read job history. FRONT_OFFICE is read-only; FINANCE, inactive and anonymous users have no access. The assignment directory exposes only active housekeeping IDs and names, without changing profile read policies.
- Lists paginate 20 jobs; details show the latest 50 history events. Use Completed/Cancelled filters to review closed work.

Run `npm test` or the entire `supabase/tests/housekeeping.sql` in a disposable development database. Tests cover assignments, stale versions, notes, direct-room bypass denial, cleaning progression, completed/cancelled history, automatic checkout jobs and role restrictions. The upgrade test covers preexisting dirty and occupied rooms.

Manual check: checkout a guest; open their DIRTY job; assign a cleaner (or progress it as manager); move through all four steps; verify the room becomes AVAILABLE and the job moves to Completed. Try a second housekeeping account on an assigned job to verify denial.

## Staff management

Apply only `supabase/migrations/202609270006_staff_management.sql`. Then open **Management -> Users**. OWNER can edit names/phone, roles and active status; MANAGER can review accounts and activity but cannot change them. Other roles cannot access staff management. Existing profiles need no recreation.

Creating a new Auth account from the app additionally requires a server-only key from the same Supabase project:

```dotenv
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
```

Set it in `.env.local` for local development or in the hosting server environment, then restart Next.js. Never prefix this variable with NEXT_PUBLIC_. A Supabase secret key (sb_secret_...) or legacy service_role key can be used here. Keep the existing public URL and anon/publishable key unchanged. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) and [Auth admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser).

The key is optional for listing/updating existing staff. Without it, create the Auth user through Supabase Authentication, then set their role and activate them using Users. No production key or account was created by this implementation.

**Add staff** defaults to HOUSEKEEPING. Enter the name, verified staff email, an initial password, optional phone, role and active status. Passwords require at least 12 characters and at most 72 UTF-8 bytes; the hosted Supabase password policy may impose additional requirements. Give credentials directly to the intended staff member. Account creation confirms the email after the owner's explicit verification checkbox; it sends no invitation. Password reset, mandatory first-login password changes, Auth email changes and deletion are not implemented here.

Provisioning is deliberately two steps because Auth and database calls are separate transactions:

1. An authorized OWNER creates the Auth account using the isolated server-only admin client. Auth's database trigger creates an inactive FRONT_OFFICE profile.
2. The owner's normal session configures the role/status through the authorized profile RPC. If this step cannot be confirmed, the app links to the created profile for review instead of deleting the account or retrying creation. The initial profile has no operational access until activation succeeds. After an interrupted response, check Users/Supabase before retrying.

Profile updates use a version check. A private database counter serializes changes to active owners and prevents removing the last one, including direct profile writes and Auth deletion cascades. An empty new database still allows the initial owner bootstrap. Each profile change records the actor, time and changed field names, without copying passwords or personal field values. Accounts that predate the migration have no invented historical events.

Inactive profiles lose operational access through the existing server/profile and database role checks, even if the Auth token has not expired. Open housekeeping assignments are retained; reassign them as management. Staff-name snapshots in old task history are preserved. The UI prevents changing your own role/status; ask another owner to do so.

Validation: `npm test` covers the eight SQL suites, last-owner protection, manager/cleaner/inactive/anonymous denial, stale updates, housekeeping roster activation, password input limits, and upgrading an existing owner. Run the whole `supabase/tests/staff.sql` only on a disposable development database: it temporarily isolates owner fixtures and rolls everything back. The local harness does not call hosted Supabase Auth or simulate multi-session concurrency.

Manual acceptance with configured credentials: create a HOUSEKEEPING account; confirm it appears in assignments; log in as that staff member; deny Users access; deactivate the account and verify operational access stops. Test a duplicate email, two edit tabs and last-owner demotion. If no secret key is configured, verify the setup message and that editing an existing staff account still works.
