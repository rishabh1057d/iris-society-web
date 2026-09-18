# Beginner Mode

Internal product and engineering notes for IRIS Society’s **Beginner Mode** experience at `/beginner`.

Use this doc when onboarding contributors, deciding whether to ship publicly, or extending lessons and content.

> **Implementation update (2026-09-08):** Beginner Mode is now live. The hub has three destinations: Tutorials, Guides, and Learn from the best. Basics content was folded into the first two. Real lesson data lives in `lib/beginner/learning-content.ts` and the former section stub now renders the responsive learning library. Sections below that describe the WIP gate and four-item v1 shell are retained as implementation history.

---

## 1. What it is

Beginner Mode is a **full-screen, immersive learning shell** for people who are new to photography and videography.

It is intentionally **not** a normal site page:

| Normal pages (`/team`, `/events`, …) | Beginner Mode (`/beginner`) |
|--------------------------------------|-----------------------------|
| Site navbar + footer | No navbar, no footer |
| Scrolls with the rest of the site | Fixed viewport “mode” (`h-dvh`) |
| Content-first listing | Guided flow: welcome → intent → hub → section |
| Shared page chrome | Own layout, motion, and exit control |

**Route:** `/beginner`  
**Audience:** Students who feel lost on a club site full of events, POTW, and team pages, and want a calmer on-ramp into the craft.

**Product one-liner:**  
*A calm, Apple-like guided mode that asks what you want to learn, then routes you into clear learning tracks.*

---

## 2. Why it was built

### Problem

The main IRIS site is strong for people who already know what they want (events, Photo of the Week, team). Absolute beginners often need:

1. A soft welcome (not a wall of cards)
2. Help naming what they want to learn
3. Clear tracks instead of hunting through the whole site
4. A visual tone that feels premium and patient, not rushed

### Goals (v1)

1. Ship an **immersive shell** with solid motion and phone/desktop layouts
2. Capture **learning intent** via a short checklist
3. Present four **section destinations** (Tutorials, Guides, Basics, Learn from the best)
4. Keep the mode **self-contained** (exit returns to home; no site chrome)
5. Gate public release until real lesson content exists

### Non-goals (v1)

- Full curriculum / CMS
- Accounts or progress syncing across devices
- Auto-skipping the welcome based on `localStorage`
- Replacing `/about`, workshops, or external resources wholesale

v1 is the **shell and motion**. Section bodies are placeholders until content is written.

---

## 3. Current public behavior (WIP gate)

Beginner Mode is **implemented but gated**.

In `lib/beginner/content.ts`:

```ts
/** Flip to true when Beginner Mode is ready to ship publicly. */
export const BEGINNER_MODE_LIVE = false
```

In `app/beginner/beginner-client.tsx`:

```ts
export default function BeginnerClient() {
  if (!BEGINNER_MODE_LIVE) return <BeginnerWip />
  return <BeginnerExperience />
}
```

When `BEGINNER_MODE_LIVE === false`:

- `/beginner` still resolves (nav and home can link to it)
- Users see **BeginnerWip**: “We are still working on this”
- The full welcome → checklist → hub flow does **not** run

When `BEGINNER_MODE_LIVE === true`:

- Users get the full `BeginnerExperience` flow
- Section pages remain stubs until real content is added

This was intentional: keep the route linkable and the code on `main`, without releasing an unfinished product.

---

## 4. How to remove the “coming soon” / WIP page

### Show the real experience

1. Open `lib/beginner/content.ts`
2. Set:

```ts
export const BEGINNER_MODE_LIVE = true
```

3. Run locally or deploy, then open `/beginner`

You do **not** need to delete `components/beginner/beginner-wip.tsx` to go live. Keep it as a future kill switch if needed.

### Copy to update when going live

Flip the flag **and** update user-facing “coming soon” language:

| Location | Today (gated) | Suggested when live |
|----------|---------------|---------------------|
| `components/home/home-landing.tsx` | Index hint `"Coming soon"` | e.g. `"Learn the craft"` |
| Same file | “Beginner Mode is on the way” | Present tense, e.g. “Enter Beginner Mode” |
| `app/beginner/page.tsx` metadata | Description says “still in progress” | Describe the live learning mode |
| Nav label | `"Beginner"` (fine) | Optional: keep as-is |

### Important caveat

Turning the flag on **without** filling section content still shows placeholder copy inside each section (“Guides, videos, and articles for this path are on the way”). Prefer shipping the flag only after at least a first batch of real lessons or links exists.

---

## 5. User flow (when live)

State machine type: `BeginnerPhase` in `lib/beginner/content.ts`.

```
                    ┌─────────────┐
                    │   welcome   │
                    └──────┬──────┘
                           │ Continue
                           ▼
                    ┌─────────────┐
           Skip ───│  checklist   │
            │       └──────┬──────┘
            │              │ Continue
            │              ▼
            │       ┌─────────────┐
            │       │  hub-roll   │  (title roll animation)
            │       └──────┬──────┘
            │              │ onRollComplete / Skip
            ▼              ▼
                    ┌─────────────┐
                    │     hub     │  (pick a section)
                    └──────┬──────┘
                           │ open section
                           ▼
                    ┌─────────────┐
                    │   section   │  (stub or future content)
                    └─────────────┘
```

### Phase details

| Phase | Component | Behavior |
|-------|-----------|----------|
| `welcome` | `WelcomeCinema` | Cinematic title; Continue → checklist; Skip → hub |
| `checklist` | `IntentChecklist` | Multi-select goals; Continue → hub-roll; Skip → hub |
| `hub-roll` | `TitleRollHub` (`mode="roll"`) | Animated introduction of section titles |
| `hub` | `TitleRollHub` (`mode="hub"`) | Interactive section picker |
| `section` | `SectionStub` | Placeholder for one of four tracks; Back → hub |

### Product rules (locked in v1)

1. **Every visit starts at `welcome`.** Do not persist “seen intro” in `localStorage` to auto-skip.
2. **Skip is explicit.** Only advance past intro/checklist if the user taps Skip (or completes Continue).
3. **Exit** leaves the mode entirely (link to `/`).
4. **Phone and desktop** use separate compositions where needed (not a shrunk desktop layout).
5. **`prefers-reduced-motion: reduce`** shortens timelines and uses simpler fades (`bmPhaseReduced`).

### Checklist options

Defined in `CHECKLIST` (`lib/beginner/content.ts`):

| Id | Label |
|----|--------|
| `exposure` | Exposure and light |
| `composition` | Composition |
| `camera` | Camera basics |
| `editing` | Editing starters |
| `video` | Videography basics |

Selected goals are held in client state. v1 does **not** deeply personalize the hub from them yet (future work).

### Hub sections

Defined in `SECTIONS`:

| Id | Label | Blurb |
|----|--------|--------|
| `tutorials` | Tutorials | Step by step lessons you can follow along |
| `guides` | Guides | Practical how-tos for real shoots |
| `basics` | Basics | Foundations that stick |
| `best` | Learn from the best | Inspiration and craft from strong work |

---

## 6. Entry points and chrome

### How users reach `/beginner`

1. **Navbar** — `{ href: "/beginner", label: "Beginner" }` in `components/navbar.tsx`  
   - Navbar returns `null` when `pathname.startsWith("/beginner")` so chrome does not stack on the mode.
2. **Home landing** — CTA / index chip in `components/home/home-landing.tsx` (currently framed as coming soon).
3. **Sitemap** — `/beginner` is included in `app/sitemap.ts`.

### Layout / chrome

- `app/beginner/layout.tsx` — fixed full-viewport shell (`z-[200]`), dark background, no footer.
- Site `ScrollProgress` and navbar are gated off for this path.
- Body scroll is locked while the live experience mounts (`document.body.style.overflow = "hidden"`).

---

## 7. File map

```
app/beginner/
  page.tsx                 # Route + metadata
  layout.tsx               # Immersive shell (no footer)
  beginner-client.tsx      # LIVE flag gate + phase machine

lib/beginner/
  content.ts               # BEGINNER_MODE_LIVE, CHECKLIST, SECTIONS, phases
  motion.ts                # Beginner-specific easing / phase transitions

components/beginner/
  beginner-wip.tsx         # Public “still working” gate
  beginner-field.tsx       # Background field / atmosphere
  beginner.css             # Mode-specific typography and utilities
  welcome-cinema.tsx       # Welcome phase
  intent-checklist.tsx     # Checklist phase
  title-roll-hub.tsx       # Hub-roll + hub
  section-stub.tsx         # Per-section placeholder
  rising-words.tsx         # Shared word-rise title animation
```

Related site wiring:

- `components/navbar.tsx` — Beginner link + hide-on-`/beginner`
- `components/home/home-landing.tsx` — Home entry + coming-soon copy

---

## 8. Design and motion notes

- **Tone:** Premium, critically damped motion (little or no bounce); calm typography; dark base `#0F1013`.
- **Display type:** Large titles with negative tracking; rising / blur-in word animations via `RisingWords`.
- **Background:** Dedicated field component (`BeginnerField`), not the main site particle/silk experiments.
- **Copy:** Prefer plain punctuation (no em dashes) in user-facing strings, consistent with the rest of the site cleanup.
- **Touch:** Large tap targets (`min-h-[44px]` / `48px` on primary actions).
- **Safe areas:** Top controls respect safe-area insets via beginner CSS utilities (`bm-safe-top`, etc.).

Motion helpers live in `lib/beginner/motion.ts` (`bmEase`, `bmEaseOut`, `bmPhase`, `bmPhaseReduced`).

---

## 9. What is finished vs unfinished

### Done (shell)

- [x] `/beginner` route and immersive layout
- [x] WIP public gate via `BEGINNER_MODE_LIVE`
- [x] Welcome cinema (phone + desktop)
- [x] Intent checklist
- [x] Title roll → hub
- [x] Section stub screens
- [x] Exit / back navigation
- [x] Reduced-motion variants
- [x] Nav + home entry points
- [x] Hide site chrome on `/beginner`

### Not done (content / product)

- [ ] Real lessons, articles, embeds, or curated link lists per section
- [ ] Using checklist answers to filter or order the hub
- [ ] Progress / bookmarks (if desired)
- [ ] Deep links to a specific section (e.g. `/beginner?section=tutorials`)
- [ ] Media pipeline for lesson assets (prefer external object storage such as Cloudflare R2 for growing libraries; avoid stuffing large originals into git)
- [ ] Final go-live copy pass on home + metadata
- [ ] Accessibility pass on the full live flow after content lands

---

## 10. Future plans

Suggested order once you decide to invest again:

### Phase A — Minimum lovable content

1. Write or curate **3–5 items** per section (even if they are external YouTube / docs links with short IRIS intros).
2. Replace `SectionStub` with a real section view driven by a small content module (TypeScript/JSON is enough at first).
3. Optionally map checklist ids → recommended section order.

### Phase B — Flip the gate

1. Set `BEGINNER_MODE_LIVE = true`.
2. Update home / metadata “coming soon” strings.
3. Smoke-test phone + desktop + reduced motion.
4. Announce on Instagram / campus channels.

### Phase C — Deeper product (optional)

- Personalization from checklist
- In-mode search
- “Continue where you left off” (only if product wants it; do not break the “every visit starts at welcome” rule without an explicit decision)
- Contributor path for lesson PRs when the repo is open source

### Open-source note

When the site goes public, Beginner Mode is a strong **feature PR** surface (UI, motion, lesson JSON). Lesson **binaries** (large images/video) should follow the same media strategy as POTW/events (object storage), not unbounded growth of `public/`.

---

## 11. Operator checklist

### Preview the WIP page (current production behavior)

1. Ensure `BEGINNER_MODE_LIVE = false`
2. Visit `/beginner`
3. Confirm “We are still working on this” and Back to home / Meet the team

### Preview the full shell locally

1. Set `BEGINNER_MODE_LIVE = true` in `lib/beginner/content.ts`
2. `pnpm dev` (or `npm run dev`)
3. Visit `http://localhost:3000/beginner`
4. Walk: welcome → checklist → hub-roll → hub → each section → Back → Exit (X)
5. Set the flag back to `false` before committing if you are not shipping yet

### Ship publicly

1. Land real section content (or accept stubs knowingly)
2. `BEGINNER_MODE_LIVE = true`
3. Update home + metadata copy
4. Deploy
5. Verify production `/beginner` once

---

## 12. FAQ

**Q: Is Beginner Mode broken because I only see “still working on this”?**  
A: No. That is the intentional WIP gate. Flip `BEGINNER_MODE_LIVE` to preview or ship the real flow.

**Q: Why gate instead of hiding the nav link?**  
A: So the route, layout, and marketing entry points can exist on `main` while content catches up, without exposing empty section stubs to everyone.

**Q: Does selecting checklist items save anywhere?**  
A: Only in React state for that visit. Refreshing restarts at welcome.

**Q: Can I delete `beginner-wip.tsx`?**  
A: Not required. Keep it unless you are sure you will never want a public “under construction” state again.

**Q: Where do I add real tutorials?**  
A: Extend beyond `SectionStub`—introduce a content source (module/JSON) and render lists/articles inside the section phase. Do not overload `content.ts` with huge media; store URLs to compressed assets.

---

## 13. Changelog (high level)

- Shell planned and implemented: welcome, checklist, hub-roll, hub, section stubs, immersive layout, chrome hiding.
- Public gate added: `BEGINNER_MODE_LIVE = false` → `BeginnerWip`.
- Flag and WIP copy remain the control surface until content is ready and the mode is announced.

---

*Last updated for the codebase state where `BEGINNER_MODE_LIVE` defaults to `false` and section destinations are stubs.*
