# IRIS Society website

The student photography and videography society website: events, gallery,
photo-of-the-week, team/meetups, and Beginner Mode with free learning resources.
Next.js App Router, React, TypeScript, Tailwind CSS, and Framer Motion power the UI.
Supabase powers Google sign-in, event registration, and registration admin tools.

## Run locally

Use Node.js 22 (22.14 or newer) and pnpm 10.12.4.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. The default dev server listens only on your machine;
use `pnpm dev --hostname 0.0.0.0` explicitly for trusted-device mobile testing.
Content and UI work need no secrets. Without Supabase configuration, the site
still builds and registration/admin pages explain that database features are off.

## Optional database setup

For local configuration, create `.env.local` from [`.env.example`](.env.example)
and fill in your own development Supabase credentials. The template documents
every environment variable the application uses; integration-generated database
credentials are not needed by this app. Restart the local server after changing
environment variables. Keep `.env.local` out of Git.

Admin access requires `ADMIN_EMAILS`. See [the event API security checklist](docs/API_SECURITY.md)
for database access rules and deployment configuration.

In a new Supabase project you control, run `sql/create_events_table.sql`, then
`sql/create_event_config_table.sql`. These are fresh-project setup scripts, not
instructions to recreate existing production tables. Use `sql/harden_event_access.sql`
for existing tables. Create the public `event-posters` bucket using the commented
SQL in the first script; its uploads must remain server-only.
Enable the Google provider in Supabase Auth using your own Google OAuth client,
set the local Site URL, and allow the callback URLs
`http://localhost:3000/events/register` and
`http://localhost:3000/admin/dashboard/event-registration`.
Never share the society's production service-role key with contributors.

## Checks

```sh
pnpm test
pnpm typecheck
pnpm audit --prod
pnpm build
pnpm start
# In another terminal:
pnpm test:smoke
```

Tests use fake users/database responses; smoke tests check anonymous requests
against the running app. CI uses no production credentials. A small dependency
patch protects the build-only braces parser; see `docs/DEPENDENCY_SECURITY.md`.

## Project map

- `app/`: pages and HTTP API handlers.
- `components/`: shared UI and registration components.
- `lib/beginner/`: free photography/videography learning content.
- `lib/api-auth.ts`: verified-session and admin authorization.
- `public/*.json`: public society/content data, never registration exports.
- `public/images/`: compressed, categorized assets.
- `sql/`: safe fresh-project setup and existing-project hardening.
- `tests/`: authorization, preview isolation, image, and HTTP regression checks.

Vercel Production uses the society database. Privileged production credentials are
absent from previews; preview registration/admin features are disabled, not connected to
production. Do not restore production keys to previews to bypass this boundary.

## Contribute and licensing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR and
[SECURITY.md](SECURITY.md) for private security reports. Original code is MIT
licensed; photographs, videos, branding, and third-party fonts are separately
covered by [ASSET_LICENSE.md](ASSET_LICENSE.md).
The code license does not authorize copying, reposting, editing or selling the
photos/videos, removing creator credits, or claiming them as your own. Obtain
prior written permission from the rights holder unless another license or law
permits the use. Attribution alone is not permission.

See [image asset conventions](docs/IMAGE_ASSETS.md) before adding or renaming website images.
Maintainers can use the [release verification record](docs/OPEN_SOURCE_RELEASE.md)
to distinguish completed checks from deployment/account checks still pending.
