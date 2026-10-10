<p align="center">
  <img src="public/images/brand/iris-logo.png" width="144" alt="IRIS Society logo">
</p>

<h1 align="center">IRIS Society</h1>

<p align="center">
  <strong>The Photography &amp; Videography Society of the IIT Madras BS Degree Programme</strong><br>
  Through our lenses, beyond the ordinary.
</p>

<p align="center">
  <a href="https://iris-society.iitmbs.org">Visit the website</a> ·
  <a href="https://iris-society.iitmbs.org/beginner">Start learning</a> ·
  <a href="CONTRIBUTING.md">Contribution guide</a> ·
  <a href="ASSET_LICENSE.md">Media rights</a>
</p>

[![CI](https://github.com/rishabh1057d/iris-society-web/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rishabh1057d/iris-society-web/actions/workflows/ci.yml)

## A little about us 📷

IRIS is a student community for learning photography and videography, telling
stories, and finding people to create with. This repository is the home of our
website, built by students for the IIT Madras BS community.

Phone camera or DSLR, first photograph or fiftieth edit: curiosity belongs here.
So does that folder named `final_final_actually_final`.

We are opening the code so students can improve the website, suggest features,
and learn by building something their community actually uses. You do not need
to be an expert photographer *and* an expert developer to start.

## What's in the frame?

| Explore | What you'll find |
| --- | --- |
| [Beginner Mode](https://iris-society.iitmbs.org/beginner) | Photography and videography tutorials, guides, and free learning resources. |
| [Events](https://iris-society.iitmbs.org/events) | Society workshops, competitions, and event updates. |
| [Photo of the Week](https://iris-society.iitmbs.org/potw) | A spotlight on student work and the winners' archive. |
| [Gallery](https://iris-society.iitmbs.org/gallery) | Photographs and visual stories from our community. |
| [Photowalks](https://iris-society.iitmbs.org/meetups) | Opportunities to explore and shoot together. |
| [Team](https://iris-society.iitmbs.org/team) | The people behind IRIS. |

Under the hood: **Next.js App Router, React, TypeScript, Tailwind CSS, and Framer
Motion**. Supabase powers Google sign-in, event registration, and registration
admin tools. The camera does not run on JavaScript. The website does.

## Want to contribute? Start here 🎓

> [!IMPORTANT]
> **Community pull requests and contributions are accepted only from students
> currently enrolled in the IIT Madras BS Degree Programme.** This includes code,
> content, assets, and feature suggestions. Maintainers must privately verify
> student eligibility before accepting a community contribution. Contributions
> from non-students will not be accepted; their community PRs will be closed
> without merging.

Start with a focused [issue](https://github.com/rishabh1057d/iris-society-web/issues),
then read [CONTRIBUTING.md](CONTRIBUTING.md). Small fixes, clearer lessons, better
accessibility, and thoughtful ideas are welcome. A first PR does not need to be
a cinematic universe.

If your student status has not been verified, maintainers will arrange a private
check through the society's official contact. **Do not post student IDs,
institutional email addresses, enrollment documents, or other proof in public
issues or PRs.** A checkbox or claimed email address alone is not verification.

This is an acceptance policy for contributions to the society's repository,
not a restriction on the [MIT license](LICENSE). Others may still use or fork
the MIT-licensed code under its terms. A public repository does not prevent
non-students from opening a PR; maintainers enforce eligibility before acceptance.
Anyone can report a suspected vulnerability privately via [SECURITY.md](SECURITY.md).

## Run locally

Use **Node.js 22 (22.14 or newer within 22.x)** and **pnpm 10.12.4**.

```sh
git clone https://github.com/rishabh1057d/iris-society-web.git
cd iris-society-web
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. No DSLR required; a reasonable number of browser
tabs is recommended.

The default dev server listens only on your machine;
use `pnpm dev --hostname 0.0.0.0` explicitly for trusted-device mobile testing.
Content and UI work need no secrets. Without Supabase configuration, the site
still builds and registration/admin pages explain that database features are off.

<details>
<summary><strong>Optional: database and authentication setup</strong></summary>

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

</details>

## Before you press the shutter on a PR

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

Test affected pages on desktop and phone, keep your change focused, and describe
what you checked. Your PR should have a clear subject, much like your photographs.

## Where things live

- `app/`: pages and HTTP API handlers.
- `components/`: shared UI and registration components.
- `lib/beginner/`: free photography/videography learning content.
- `lib/api-auth.ts`: verified-session and admin authorization.
- `public/*.json`: public society/content data, never registration exports.
- `public/images/`: compressed, categorized assets.
- `sql/`: safe fresh-project setup and existing-project hardening.
- `tests/`: authorization, preview isolation, image, font, and HTTP regression checks.

Vercel Production uses the society database. Privileged production credentials are
absent from previews; preview registration/admin features are disabled, not connected to
production. Do not restore production keys to previews to bypass this boundary.

## Open code, protected creative work

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR and
[SECURITY.md](SECURITY.md) for private security reports. Original code is MIT
licensed; photographs, videos, branding, and third-party fonts are separately
covered by [ASSET_LICENSE.md](ASSET_LICENSE.md).
The code license does not authorize copying, reposting, editing or selling the
photos/videos, removing creator credits, or claiming them as your own. Obtain
prior written permission from the rights holder unless another license or law
permits the use. Attribution alone is not permission.

See [image asset conventions](docs/IMAGE_ASSETS.md) before adding or renaming website images.
For contribution verification, media-permission requests, or a hello, contact
photography.society@study.iitm.ac.in. Maintainers can use the
[release verification record](docs/OPEN_SOURCE_RELEASE.md) for checks and their evidence.

Built by students. Reviewed by humans. Best enjoyed with curiosity.
