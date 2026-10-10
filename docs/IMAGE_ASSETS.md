# Image assets

Website images live in `public/images` with lowercase, hyphen-separated names:

- `brand`: logos and favicon (PNG, preserving transparency).
- `about`: society photos and the contact-page collage.
- `events/posters`: competition and workshop posters; `events/artwork` holds shared event artwork.
- `gallery`: competition entries, grouped by competition, and photo-of-the-day entries.
- `potw`: winners grouped by year/month, plus shared announcements and break artwork.
- `meetups`: photowalk photos.
- `team/optimized`: portraits used by the previous-members page.
- `team/portraits`: retained alternative portraits, including previously unused originals.
- `beginner`: learning-specific illustrations. Lessons can also reuse gallery/POTW images.

Most assets use WebP at quality 86. Photos are capped at a 2400px long edge;
posters/meetups at 1800px; about photos at 1920px; team portraits at 900–1200px.
Images are never enlarged or cropped. Smaller existing encodings are retained
when conversion would increase file size. Keep full-resolution masters separately
from this web directory.

Use the full new `/images/...` path in public JSON and components. The maintenance
prompts accept a path relative to `/images/`, including its subfolders.
The existing team optimization script writes new portraits to `team/optimized`
and skips images that are already optimized.

`lib/image-paths.json` records the old-to-new URLs. The [Next.js redirects configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
keeps old bookmarks, cached data and external references working without keeping
duplicate image files. Do not use those old paths for new content.

Run `node --test tests/image-assets.test.mjs` to check file references, names,
image decoding and redirect coverage. These assets are compressed ahead of time;
the site does not need Vercel's image optimization service for them.
