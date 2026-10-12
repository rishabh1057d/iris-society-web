# Photo of the Week

POTW uses the existing Supabase Google sign-in and server-side `ADMIN_EMAILS` checks. The website stays on Vercel. Supabase stores competition data and approved identities. Private Cloudflare R2 Standard buckets hold photographs. No Cloudflare domain, DNS change, Worker, or paid image service is required.

## Launch status, 12 October 2026

Development continues on `feature/potw-platform`, keeping POTW off `main` until testing is complete. CI runs on pushes to this branch and on pull requests. Vercel Production remains disabled (`POTW_ENABLED=0`). The society's exact POTW branch now has an explicitly approved signed-in testing configuration. Other branches and forks remain database-disabled. The public archive still works with participation disabled. Submissions require approved membership and a published open competition.

Six migrations have been applied to the existing Supabase project `fcsckgoncwylmtdxfofo`, including AE/MG email constraints and separate test competitions. All 12 POTW tables have RLS enabled, with no `anon` or `authenticated` table privileges or access policies. Private data is deliberately accessed only through authorized server APIs. The service-only transactional functions are not executable by browsers.

The `iris-potw-lifecycle` database job runs every minute and its first successful execution was verified. The daily database housekeeping job is scheduled. All 53 static archive entries were imported and counted. The original `public/potw.json` and local images were preserved.

Cloudflare management access now works. Both private buckets, `iris-potw-originals` and `iris-potw-display`, were created in APAC with Standard storage. Their exact-origin CORS policies, disabled `r2.dev` access, and absence of custom domains were read back and verified. The originals bucket has a one-day expiration rule scoped only to `staging/`. Unsigned S3 bucket-list requests were denied with `InvalidArgument: Authorization` (HTTP 400), not treated as successful S3 access.

The connector returns Cloudflare error `9109: Unauthorized to access requested resource` for account/user API-token management and permission-group endpoints. The owner created the application token manually and saved both S3 credentials in the ignored local environment file. Authenticated access to both buckets and the live storage integration test passed. An S3 bucket-configuration read with the application credentials was denied with HTTP 403, as expected for object-only access. The token's full policy cannot be independently read through this connector, so retain the owner-configured restriction to the two POTW buckets. Do not share either S3 credential in chat.

Vercel production now has all required POTW environment keys, including `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` as sensitive, production-only values. `POTW_ENABLED=0` remains unchanged. Names, types, and production-only scope were verified without printing secret values. The corresponding local configuration is in the ignored `.env.local`, preserving its other settings. The owner explicitly approved one student account for launch testing, which was added to the private roster with an audit record. Its existing confirmed Google identity resolves successfully. No private student details were added to Git. No deployment, hosting change, DNS change, or paid service purchase was performed.

## Internal branch testing

Use the stable alias `https://iris-society-iitmbs-git-feature-p-1587b6-rishabh1057ds-projects.vercel.app/potw`. Group members need the private, expiring Vercel share link supplied separately to the owner, then sign in with their approved institutional Google account. The share link bypasses Vercel's deployment gate, never the application's membership/admin checks. Do not publish that link in Git.

Only Preview variables for `feature/potw-platform` enable this: `POTW_ENABLED=1`, `POTW_PREVIEW_ENABLED=1`, `POTW_TEST_MODE=1`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, and the five `R2_*` variables listed in `.env.example`. Secret values are sensitive variables. Production settings remain separate and unchanged. Public Supabase settings are inherited. `CRON_SECRET` and PostgreSQL credentials are not copied to Preview. Vercel system variables and fork protection are enabled so the server can verify the society's exact repository and branch. Flags alone cannot enable another branch or a fork.

Test competitions have `is_test=true`. The existing official competition and its submission remain `false`. Lists, featured winners, student history, mutations, and image access are filtered by this flag. Each mode has its own featured competition. Test results never become official winners after a merge. The approved roster is shared but read-only in testing. The preview allows only POTW APIs and the admin-session check, not registration exports, event configuration edits, or poster uploads. Search crawlers are blocked and test competitions are omitted from the sitemap.

Start at `/admin/dashboard/potw` to create/publish an internal theme. Review, confirm the shortlist, and manually advance phases with a reason when ready to test voting. A single finalist skips voting, so use at least two shortlisted photographs to test it.

This shares the existing physical Supabase project, private R2 buckets, identities, rate limits, and storage budget. It is application-level competition isolation, not an independent staging database. Never give branch credentials to contributors. Real launch still requires the group upload-to-winner acceptance test. After testing, revoke the Vercel share link, remove branch secrets and its exact R2 CORS/OAuth entries, and disable branch participation. Those settings do not replace production settings during a merge.

## Student verification

Event registration verifies ownership of a confirmed institutional email, but does not independently prove enrollment or IRIS membership. A student-ID pattern and editable Google/Supabase user metadata are not evidence of enrollment.

An admin imports a private, society-verified CSV in `/admin/dashboard/potw`, with columns `student_id,email,display_name`. An approved institutional Google email must match the roster. Only approved, active members can submit, view protected galleries, or vote. Supported institutional domains are `ds.study.iitm.ac.in`, `es.study.iitm.ac.in`, `ae.study.iitm.ac.in`, and `mg.study.iitm.ac.in`. Generic `study.iitm.ac.in` addresses and personal Gmail accounts are not student identities. A supported domain alone never grants access.

For approved alternate accounts, repeat the same canonical student ID on each email row. The database binds accounts to that identity and enforces submission/voting uniqueness against it. An existing binding cannot silently move to another student. Reimporting the CSV does not reactivate revoked students. Revocation takes effect on subsequent API requests, including private-image authorization.

On 12 October 2026, the owner's private membership workbook was imported using the existing transactional roster function. Supabase contains 1,351 approved student identities and 1,352 approved emails, including four AE and four MG accounts. All imported emails, names, and identity mappings were reconciled against the workbook. Names and email addresses remain only in the private database and the owner's local files. The database audit records the source filename, SHA-256 fingerprint, import counts, and owner authorization.

Thirteen unique email entries were held for owner review: seven have conflicting names, four have roll numbers shared across DS/ES accounts with different names, and two use generic non-program institutional addresses. A private review report was saved outside the repository. No held address was approved, no existing member was removed, and revoked members are not silently reactivated. Older DS/DP email prefixes were preserved rather than rewritten based on an assumed ID format. Membership approval comes from the society's roster, not that format.

Keep real roster CSVs, private IDs, and credentials out of Git. The admin allowlist is still server-only `ADMIN_EMAILS`. Admins do not have to appear in the student roster to administer competitions. Use the Admin sign in link on `/potw`, or open `/admin` or `/admin/dashboard/potw` directly. The existing dashboard now shows its own Google sign-in gate instead of sending signed-out visitors to student event registration. Use the personal allowlisted Google account for administration and the approved institutional account for student testing.

The shared member/admin session hook defers session lookups until after auth-change callbacks return, coalesces consecutive events, and cancels scheduled work on unmount. This prevents nested Supabase session calls from hanging the sign-in flow. Membership and administrative authorization are still verified server-side on requests.

## Lifecycle and voting

Normal transitions are `draft → scheduled → submissions_open → review → voting_open → voting_closed → completed → archived`. Admins publish drafts, review entries, confirm shortlists, make permitted manual phase changes with recorded reasons, and resolve exceptional results. Saving a featured draft does not replace the current published featured competition. Publication switches it transactionally.

Dates are stored as timezone-aware timestamps and enforced using the database clock after locks are acquired. Forms and displayed deadlines use Asia/Kolkata (IST). The browser's clock cannot grant a late submission or vote. APIs advance due phases as a fallback to the database cron job.

Only ready, admin-shortlisted entries can enter voting. The confirmed shortlist freezes when voting starts. Every entry is then locked, including rejected and non-shortlisted photographs. A student gets one immutable vote per canonical identity per competition and cannot vote for their own entry through another account. Names and live vote counts are not included in voter responses before finalization. Titles, captions, and visible watermarks still require an admin anonymity check.

With at least two finalists, each shortlisted photographer can vote for another finalist. A single confirmed finalist skips voting and is published at the scheduled voting-close time. Nobody is offered an invalid self-vote. Without a confirmed shortlist, automatic voting does not start. An admin must reschedule review or explicitly close the competition.

After voting closes, a unique positive-score leader publishes automatically. A positive-score tie requires an admin to choose one of the tied leaders and record a reason. With no votes, an admin chooses a shortlisted entry or declares no award, with a reason. Finalization is transactional and idempotent. Results, votes, and audit records cannot be edited or deleted through the service role. Published winners appear on `/potw` and the homepage without JSON edits or redeployment.

## Storage setup

These private Standard buckets already exist in the connected Cloudflare account:

- `iris-potw-originals`, including the temporary `staging/` prefix.
- `iris-potw-display`, containing sanitized display and thumbnail WebP objects.

Leave `r2.dev` disabled and do not add public custom domains. Use bucket-scoped object read/write S3 credentials, not an account-wide management token, for the application. Store credentials directly in Vercel and local ignored environment files. Do not paste them into chat or Git.

The exact-origin CORS configurations are in `infra/r2/potw-originals-cors.json` and `infra/r2/potw-display-cors.json`. They use the S3 `CORSRules` shape. A Cloudflare management API may use a different wrapper, so adapt to its current schema when applying them. Only the approved POTW branch origin is included alongside production and local development. CORS is not an authorization boundary.

The applied staging-only lifecycle rule expires objects under `staging/` after one day. Its Cloudflare API manifest is `infra/r2/potw-originals-lifecycle.json`. Never add a bucket-wide expiration rule. Accepted originals use a separate server-generated key, so replaying a still-valid staging PUT cannot change an accepted photograph. Both buckets' privacy, CORS, storage class, and lifecycle were verified through management APIs. Signed PUT/GET behavior, MIME and byte-length restrictions, allowed/blocked CORS origins, private existing objects, sanitized derivatives, and bearer-link expiry passed the live storage test. Full student/admin workflow testing is still required before enabling participation.

An upload is initiated only after authentication, membership, deadline, quota, and parameter checks. Its pending session contains a server-generated staging key. The browser PUT goes directly to R2 using a URL valid for at most five minutes, bounded by the submission deadline. The signature includes content type and byte length.

The completion endpoint checks object headers, reads a bounded object with an ETag condition, verifies JPEG/PNG/WebP magic and full decoding, rejects animation and corrupt or oversized files, and generates display derivatives using Sharp. Original uploads are limited to 5 MiB and 48 megapixels. A 2048-pixel display image and 640-pixel thumbnail preserve aspect ratio, autorotate, and remove metadata, including EXIF/GPS. The unchanged original is private. Failed replacements keep the previous accepted entry.

AI-related metadata is an admin-only review flag. Missing metadata does not establish that a photo is genuine, and an editing software marker is not proof of AI generation. There is no reliable universal AI detector in this implementation.

Owners and authorized admins can access private originals. Other approved members can only access the current shortlisted display images once the shortlist is published for voting. Only finalized winner display images and published banners have public application URLs. Buckets themselves remain private. Authorized display links expire in five minutes, original links in one minute. A copied presigned URL is a bearer link until it expires. Revocation cannot recall bytes already downloaded or instantly invalidate an existing signed URL.

## Retention and cost controls

The owner-approved policy retains non-winning and replaced image versions for one year after competition finalization. Daily maintenance then deletes those R2 files, keeping submission metadata, votes, and audit history. The winner's current version and competition's current banner are excluded. Current or unfinished competitions are not subject to that retention deletion. Abandoned uploads are temporary objects, not accepted submissions.

`vercel.json` schedules `/api/potw-maintenance` daily at 01:00 UTC. It requires the server-only `CRON_SECRET` bearer token. Each run cleans up at most 30 expired upload sessions and 30 eligible retained versions to keep work bounded. Busy periods can create a cleanup backlog. Monitor it and, if necessary, run the same protected endpoint again from a trusted server without exposing the secret. The staging-only R2 expiration rule limits abandoned staging growth independently.

The application defaults to an 8,000,000,000-byte storage budget, reserving space before issuing uploads, and stops new uploads when that tracked budget would be exceeded. There is a five-attempt-per-student daily upload limit and database-backed request/mutation throttling. The admin summary includes accepted image bytes and pending/staging reservations. This is an application estimate, not Cloudflare billing. Retried processing can leave temporary derivative objects until cleanup.

R2 Standard currently includes 10 GB-month of storage, 1 million Class A operations, and 10 million Class B operations per month. Usage beyond those allowances is billed, not automatically blocked. Monitor the whole account, including other buckets, and set billing notifications. At 80% of the configured application budget, the admin UI shows a warning. Reduce the budget or pause new competitions before exceeding your allowance. The application does not authorize a paid plan or purchase. [R2 pricing](https://developers.cloudflare.com/r2/pricing/)

Original uploads and image delivery bypass Vercel bandwidth and request-body limits. Completion still downloads at most one original to a Node function for validation and processing. There is no external processing charge, but CPU and function limits still apply. At higher traffic, measure processing time and cleanup backlog before opening more competitions. There is no paid image-transformation service or background Worker.

The every-minute lifecycle uses Supabase `pg_cron`, not frequent Vercel cron calls. Vercel Hobby's daily cron is used only for cleanup. [Supabase Cron](https://supabase.com/docs/guides/cron), [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)

## Environment variables

Copy the blank `.env.example` to an ignored `.env.local` for development. Existing keys remain `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAILS`.

New server-only keys are `POTW_ENABLED`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ORIGINALS_BUCKET`, `R2_DISPLAY_BUCKET`, and `CRON_SECRET`. Optional server overrides are `POTW_MAX_UPLOAD_BYTES` and `POTW_STORAGE_BUDGET_BYTES`. `POTW_TEST_DATABASE_URL` is only for a disposable local test database. `TEST_BASE_URL` selects the local smoke-test server. No secret value belongs in documentation or source code.

All required production R2 keys and the maintenance secret are configured. The verified local R2 credentials were transferred directly to Vercel as production-only sensitive values without printing them. Do not regenerate credentials or `CRON_SECRET` just to repeat setup. Never add production service credentials to previews. `VERCEL_ENV` and `NEXT_PUBLIC_DATABASE_DISABLED` keep previews isolated. Environment changes require a new deployment, but publishing later competitions and winners does not.

## Database migrations and checks

Applied to the existing project, with matching local migration versions:

- `20261011115936_potw_foundation.sql`, private tables, constraints, RLS, grants, indexes, immutable records.
- `20261011115951_potw_transactions.sql`, approved identity binding, lifecycle, uploads, voting, admin actions, finalization, throttling.
- `20261011120012_potw_scheduler.sql`, retention candidates and database cron jobs.
- `20261011120503_potw_storage_usage.sql`, server-only aggregate storage summary without API row-limit truncation.
- `20261012124735_potw_bs_program_domains.sql`, normalized institutional email constraint extended to AE and MG without relaxing roster approval or RLS.

Do not rerun these files in the production SQL editor. They are already recorded in Supabase migration history. Existing event tables and records were not deleted or altered. The owner-approved society roster is now imported; unresolved entries remain held for review. Competition tables remain empty until an authorized admin creates a theme.

Supabase's security advisor reports informational RLS-without-policy notices. Those are expected for these service-only tables. Do not add permissive browser policies to make the notices disappear. The advisor also reports a pre-existing leaked-password-protection warning. POTW requires Google ownership and roster approval, but this does not change the project's password-auth configuration. [RLS advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

There are indexes for member history, reviews, vote tallies, upload expiry, and audit queries. The performance advisor also lists unused new indexes and some unindexed attribution foreign keys. No existing indexes were removed. Review query plans if competition traffic grows before adding indexes solely to clear informational notices.

## Files and commands

Public and protected routes live in `app/potw/`, including competition pages, voting, submission, and history. `components/potw/` contains the preserved archive viewer, competition panel, shared Google-session gate, private-image caching, upload/voting screens, and admin screens. `lib/potw/` contains shared types, input validation, API handlers, authorization, R2 signing, and image processing. Existing `lib/api-auth.ts` and Supabase clients are reused.

`app/api/potw/[[...path]]/route.ts` serves public and member actions. `app/api/admin/potw/[[...path]]/route.ts` serves admin actions. `app/api/potw-maintenance/route.ts` is cron-only. `app/admin/dashboard/potw/page.tsx` integrates into the existing admin dashboard. The dashboard's obsolete browser token check was replaced with the existing server admin check. Homepage, sitemap, and robots were updated for published winners and protected routes.

Run:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm test:potw
pnpm lint:potw
pnpm build
pnpm typecheck
pnpm test:smoke
```

Run `pnpm test:potw:db` with `POTW_TEST_DATABASE_URL` pointing to a fresh disposable PostgreSQL database on localhost, with a name ending in `_test`. The test refuses remote databases. It creates synthetic Auth fixtures, applies migrations, exercises ownership/lifecycle/tie/retention contracts, and checks concurrent duplicate accounts and lock-wait deadline enforcement. The local database must be disposable. The vanilla PostgreSQL test does not install `pg_cron`, whose production execution was checked separately. CI provides its own PostgreSQL test service.

For a deliberate live storage check, set `POTW_TEST_R2=1` and run `pnpm test:potw:storage`. This opt-in test loads the ignored local credentials, uses the real application storage and image-processing helpers, and creates a small synthetic photograph under freshly generated object keys. It never creates a competition or student submission. It deletes only its own generated objects in `finally`, and suppresses signed URLs and credential details in error output. Without the opt-in flag, the test is skipped. The check removes only its synthetic objects, never student photographs. Set `POTW_TEST_ORIGIN` to the exact branch origin to check that origin's CORS.

`pnpm potw:import-archive` is a dry run. `pnpm potw:import-archive --apply` is the idempotent server-side import already executed for production. It imports only public archive fields and never deletes existing records or images.

## Remaining launch verification

1. R2 buckets, application credentials, live storage checks, and all seven required production environment settings are already configured and verified. Do not recreate resources or tokens. Retain Object Read & Write access restricted to `iris-potw-originals` and `iris-potw-display`. [Cloudflare token instructions](https://developers.cloudflare.com/r2/api/tokens/)
2. The owner's selected personal account is now configured in the server-only `ADMIN_EMAILS` allowlist locally and in Vercel Production, with existing production admins preserved. The approved student email remains separate and has no admin grant. Restart the local server and redeploy production before checking access through Google sign-in. To manage admins later, add or remove comma-separated addresses in the ignored `.env.local` and Vercel Production, then restart or redeploy respectively. This allowlist controls all site admin APIs.
3. The owner-approved society roster is imported. Resolve the 13 held entries using the private review report before granting those accounts access. Use two genuinely approved members for upload and voting acceptance tests, with their permission.
4. Test signed-in participation on the approved branch deployment. Its exact stable alias is in the Supabase redirect allowlist alongside the preserved existing production/local entries. Production stays disabled until acceptance testing is complete.
5. Local participation is enabled for testing. Sign in as an admin to create and publish a featured test theme with open submission dates, then perform a real approved-student upload, failed/valid replacement, admin review, shortlist confirmation, other-student vote, closure, and winner publication. Also check unapproved accounts, original privacy, and signed PUT CORS on a phone. Do not enable production participation until acceptance checks pass.
6. Verify a scheduled non-tied winner without opening the admin page, and check a tie remains pending. Check the Vercel daily maintenance invocation after deployment.
7. Keep further work on `feature/potw-platform`. Only merge to `main` and open the first real theme after the owner approves the launch checks. Never commit the private society roster or grant credentials to ordinary PR previews.

Current limitations are 13 unresolved roster entries, a missing real authenticated upload-to-winner acceptance test, and an unverified deployed maintenance invocation. Imported roster records were reconciled directly in the database, and the owner's approved-student Google sign-in was verified earlier. The selected personal Google account successfully reached the POTW management screen and existing admin dashboard. The student account was denied admin access, and the personal admin account was denied student participation. Local participation is enabled for owner testing, while production participation remains disabled. Automated tests and successful live storage checks do not replace the full launch check.

Checks completed locally were 18 POTW unit/API tests, 23 existing regression tests, the real PostgreSQL transactional/concurrency test, one opt-in live R2 storage integration test, TypeScript, scoped POTW lint, production build, and 32 built-site smoke tests. The dependency audit reported no known production vulnerabilities. All four configured server credential values were absent from the client bundles rebuilt after adding R2 credentials. Browser checks covered the public archive, loaded thumbnails, the photo viewer, and signed-out member/admin screens at desktop and mobile sizes. The archive starts on the latest month containing a winner. After R2 provisioning, tests, lint, TypeScript, production build, and built-site smoke tests were rerun, and the active Supabase lifecycle job and 53-entry archive were reconfirmed. Authenticated review, student uploads, and voting still require the launch acceptance test above.

After the local sign-in fix, 21 POTW tests, 24 existing regression tests, 35 development-server smoke tests, TypeScript, and scoped lint passed. Real Google sign-in was checked for both owner-selected accounts, with student/admin role separation and a 390-pixel mobile layout without horizontal overflow. The private storage readiness summary and approved roster loaded for the admin. No competition, submission, or vote was created. The production build was not rerun during the active development-server session to avoid conflicting with its Next.js output files. `/admin` and the legacy `/admin/login` URL now redirect to the existing dashboard's Google sign-in gate. Other legacy content editors were not rebuilt or connected to a database by this auth fix.

After extending the BS domains, 23 POTW tests, TypeScript, scoped lint, and the real PostgreSQL transactional/concurrency suite passed. Database tests accept rostered AE/MG emails and reject personal or lookalike domains. Direct browser roster access remains denied after the applied constraint migration. The additional accounts have not yet completed real Google sign-in or voting acceptance tests.
