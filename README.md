<p align="center">
  <img src="public/images/brand/iris-logo.png" width="144" alt="IRIS Society logo">
</p>

<h1 align="center">IRIS Society</h1>

<p align="center">
  The Photography and Videography Society of the IIT Madras BS Degree Programme
</p>

<p align="center">
  <a href="https://iris-society.iitmbs.org">Visit the website</a> ·
  <a href="https://iris-society.iitmbs.org/beginner">Start learning</a> ·
  <a href="CONTRIBUTING.md">Contribution guide</a> ·
  <a href="ASSET_LICENSE.md">Media rights</a>
</p>

[![CI](https://github.com/rishabh1057d/iris-society-web/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/rishabh1057d/iris-society-web/actions/workflows/ci.yml)

This is the repository for the IRIS Society website. It has our photographs,
event updates, and learning resources for students getting into photography
and videography.

We're opening up the code so IITM BS students can help maintain it and add things
they'd like to use. You can work on the website even if you're still learning
photography. Fixing a broken link or improving a guide is useful too.

## On the website

| Explore | What you'll find |
| --- | --- |
| [Beginner Mode](https://iris-society.iitmbs.org/beginner) | Photography and videography tutorials, guides, and free learning resources. |
| [Events](https://iris-society.iitmbs.org/events) | Society workshops, competitions, and event updates. |
| [Photo of the Week](https://iris-society.iitmbs.org/potw) | Weekly selections and past winners. |
| [Gallery](https://iris-society.iitmbs.org/gallery) | Photographs from the society. |
| [Photowalks](https://iris-society.iitmbs.org/meetups) | Photowalks and meetups. |
| [Team](https://iris-society.iitmbs.org/team) | The people behind IRIS. |

## How it was built

The site uses Next.js App Router, React, TypeScript, Tailwind CSS, and Framer
Motion. Supabase handles Google sign-in, event registration, and the registration
admin tools.

We used AI to build it. The "vibe coding" part also involved listening to music
while coding. The Weeknd, Chase Atlantic, Tame Impala, The Neighbourhood (NBHD),
Arctic Monkeys, Frank Ocean, and Lana Del Rey were on the playlist, along with
Arijit Singh, KK, Karan Aujla, A. R. Rahman, Shreya Ghoshal, Diljit Dosanjh, and
Mohit Chauhan.

## Contributing

We accept community contributions only from students currently enrolled in the
IIT Madras BS Degree Programme. This includes code, content, assets, and feature
suggestions. Maintainers verify student status privately before accepting a
contribution. PRs from non-students are closed without merging.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before starting. For a feature or a larger
change, open an [issue](https://github.com/rishabh1057d/iris-society-web/issues)
first so we can discuss it. Keep your PR focused and explain what you changed
and how you tested it.

If you haven't been verified, email photography.society@study.iitm.ac.in to
arrange a private check. Don't post student IDs, institutional email addresses,
or enrollment documents in issues or PRs. Ticking the student checkbox does
not verify your identity.

This policy covers contributions we accept here. The [MIT license](LICENSE)
still allows others to use and fork the code. GitHub doesn't stop non-students
from opening public PRs, so maintainers check eligibility during review.

### Using AI

You're welcome to use AI for your contribution. Read the final diff, make sure
you understand it, and test the change yourself before opening a PR. Say what
you used AI for and include the results of checks you actually ran. If you
couldn't run a check, say so.

Don't put credentials or private student data into AI prompts. Don't remove
authentication, admin checks, validation, or database access rules to get
generated code working. Changes to those protections need maintainer review
and tests for requests that should be allowed and denied. Check suggested
packages, resource links, and asset permissions as well. The full
[AI contribution rules](CONTRIBUTING.md#ai-assisted-contributions) apply even
when CI passes.

## Run locally

Use Node.js 22 (22.14 or newer within 22.x) and pnpm 10.12.4.

```sh
git clone https://github.com/rishabh1057d/iris-society-web.git
cd iris-society-web
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. You can work on content and UI without setting up
Supabase. The site still builds, but registration and admin pages will explain
that database features are off.

The dev server listens only on your machine by default. To test from a phone
on a trusted network, run `pnpm dev --hostname 0.0.0.0`.

<details>
<summary>Optional database and authentication setup</summary>

For local configuration, create `.env.local` from [`.env.example`](.env.example)
and fill in your own development Supabase credentials. The template documents
every environment variable the application uses. Integration-generated database
credentials are not needed by this app. Restart the local server after changing
environment variables. Keep `.env.local` out of Git.

Admin access requires `ADMIN_EMAILS`. See [the event API security checklist](docs/API_SECURITY.md)
for database access rules and deployment configuration.

In a new Supabase project you control, run `sql/create_events_table.sql`, then
`sql/create_event_config_table.sql`. These are fresh-project setup scripts, not
instructions to recreate existing production tables. Use `sql/harden_event_access.sql`
for existing tables. Create the public `event-posters` bucket using the commented
SQL in the first script. Uploads must remain server-only.
Enable the Google provider in Supabase Auth using your own Google OAuth client,
set the local Site URL, and allow the callback URLs
`http://localhost:3000/events/register` and
`http://localhost:3000/admin/dashboard/event-registration`.
Never share the society's production service-role key with contributors.

</details>

## Checking your changes

```sh
pnpm test
pnpm typecheck
pnpm audit --prod
pnpm build
pnpm start
# In another terminal:
pnpm test:smoke
```

Tests use fake users and database responses. Smoke tests check anonymous requests
against the running app. CI uses no production credentials. See
[dependency security notes](docs/DEPENDENCY_SECURITY.md) for the build-only
braces parser patch.

Also test the pages you changed on desktop and phone. Check keyboard access
and reduced motion where relevant. Passing these commands doesn't replace
reviewing the change for security issues.

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
absent from previews, where registration and admin features are disabled.
Do not add production keys to previews to turn those features on.

## Code and media rights

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR and
[SECURITY.md](SECURITY.md) for private security reports. Original code is MIT
licensed. Photographs, videos, branding, and third-party fonts are separately
covered by [ASSET_LICENSE.md](ASSET_LICENSE.md).
The code license does not authorize copying, reposting, editing or selling the
photos/videos, removing creator credits, or claiming them as your own. Obtain
prior written permission from the rights holder unless another license or law
permits the use. Attribution alone is not permission.

Follow the [image asset conventions](docs/IMAGE_ASSETS.md) when adding or renaming
images. Anyone can report a vulnerability privately through
[SECURITY.md](SECURITY.md).

## Getting in touch

If you're interested in the project or need help getting started, email
[photography.society@study.iitm.ac.in](mailto:photography.society@study.iitm.ac.in).
You can also ask in the society's WhatsApp or GSpace groups if you're already
a member. Use email for student verification and media-permission requests.
Security reports belong in the private channel described in SECURITY.md,
not in group chats or public issues.

Maintainers can find the release checks and their evidence in
[OPEN_SOURCE_RELEASE.md](docs/OPEN_SOURCE_RELEASE.md).
