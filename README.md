# Nithin Raj: portfolio

A personal portfolio for a frontend engineer (React.js, TypeScript, frontend architecture). It is a normal, fast,
accessible HTML page first; a single decorative WebGL scene (a procedural fish in a deep-water atmosphere, plus a
spatial echo of the project case studies) is layered behind it and loads only when the browser is idle.

The page is complete and usable with the scene absent, failed, reduced, or JavaScript turned off. That is a design
rule, not a fallback: every important fact is real HTML.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4, a handful of design tokens in `src/app/globals.css` |
| 3D | three.js + React Three Fiber (no other 3D dependencies; shaders are hand-written) |
| Fonts | Fraunces (display), Geist (UI), Geist Mono (labels), via `next/font` |
| Tests | Vitest + Testing Library (unit), Playwright + axe (browser, accessibility) |

Runtime dependencies are exactly `next`, `react`, `react-dom`, `three` and `@react-three/fiber`.

> **three is pinned to 0.182.0 on purpose.** From r183 three.js logs a `THREE.Clock` deprecation warning, and
> `@react-three/fiber` 9.x still constructs a `Clock` internally, so any newer three prints it on every page load.
> Lift the pin (and `@types/three`) once React Three Fiber moves to `THREE.Timer`.

## Getting started

```bash
npm install
cp .env.example .env.local     # optional for local work
npm run dev                    # http://localhost:3000
```

Requires Node 20.9+ (CI uses 22).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes, for production builds** | Public origin, no trailing slash. Canonical URL, Open Graph, sitemap, robots and JSON-LD derive from it. `next build` **fails** without it (Vercel's own URLs are used automatically on Vercel; set `ALLOW_MISSING_SITE_URL=1` for a throwaway local build). Dev falls back to `http://localhost:3000`. |
| `NEXT_PUBLIC_RESUME_URL` | Expected before launch | A public résumé PDF **without a phone number**: a path under `public/` or an external URL. When unset, every Resume button and link is omitted and the build prints a warning. No résumé file ships in this repo. |

Never commit real values. `.env.example` is the only env file under version control, and no secrets are needed.

## Commands

| | |
|---|---|
| `npm run dev` | Development server (also serves the dev-only `/lab/fish`) |
| `npm run build` / `npm start` | Production build / server |
| `npm run check` | Typecheck + lint + unit tests: the quick gate |
| `npm run typecheck`, `npm run lint`, `npm test` | The individual checks |
| `npm run test:e2e` | Playwright (builds and serves on :3100; serial; includes an axe scan) |

### Browser tests, Chromium and WebKit

`playwright.config.ts` runs `desktop` (Chrome) and `mobile` (Pixel 7) projects. Software GL is enabled so WebGL works
in headless runs, and runs are serial because parallel browsers starve each other's software rendering.

* **Locally**, the installed Chrome is used (`channel: "chrome"`). Add WebKit with `PW_WEBKIT=1`
  (needs a macOS version Playwright's WebKit supports).
* **In CI** (`CI=1`), Playwright's own Chromium is used and the `webkit-desktop` and `webkit-mobile` projects are added.
  `.github/workflows/ci.yml` runs `npm run check`, builds **once**, then shares that build with the Chromium and WebKit
  e2e jobs on Linux (`PW_PREBUILT=1` makes Playwright start the server instead of rebuilding). It uses public placeholder
  values (`NEXT_PUBLIC_SITE_URL=https://example.com`, a harmless résumé URL); no secrets are involved.
* Specs that need WebGL are skipped on WebKit unless `PW_WEBKIT_WEBGL=1`, because headless WebKit's software GL has not
  been verified for this project. **WebKit has not been run yet**; the first CI run is its first real verification.

## Architecture

```
src/
  app/              layout, page, metadata routes (robots, sitemap, social image, icons), dev-only lab
  content/          every word on the site as typed data: profile, experience, projects, notes, skills
  components/
    layout/         header, footer, nav, mobile menu, MotionController
    sections/       one server component per section
    ui/             Section, ButtonLink, MagneticLink, Tag, ArchitectureDiagram (HTML)
    three/          the WebGL scene (lazy, client-only)
  lib/              site config, quality tiers, choreography, scene state, project focus, structured data
  hooks/            reduced motion, active section, scene quality
e2e/                Playwright specs
```

* **Content is data.** Sections are server components that render `src/content/*`; nothing is fetched at runtime. The
  résumé is the source of truth; public repositories are only linked when their code demonstrates the claims.
* **HTML first.** Only small islands are client components: the nav indicator, the mobile menu, `MotionController`
  (scroll reveals and `#case-<id>` deep links), `MagneticLink` (primary CTA, fine pointers only) and the WebGL root.
* **Native `<details>` for case studies and architecture notes**, with CSS height animation where supported. Opening one
  updates the URL (`#case-<id>`), and the link opens it again.

### The WebGL scene

A single lazy, decorative canvas (loaded after `load` and idle) with a quality tier chosen from the device and stepped
down at runtime if frames are slow: `high`, `medium`, `low`, or `none` (CSS atmosphere only, a designed page, not an
error state). `?quality=high|medium|low|none` pins a tier for QA. Scene choreography is data
(`lib/choreography.ts`), scroll never touches React state or layout, and the project gallery is four draw calls of
data-driven diagrams. **Reduced motion** renders one composed static frame: no render loop, scroll tracking, reveals,
or pulses. Full detail in [`docs/architecture.md`](docs/architecture.md).

`src/app/lab/fish/page.dev.tsx` is a development-only viewer. Next only compiles `*.dev.tsx` pages for the dev server
(`next.config.mjs`), so the route does not exist in a production build.

## Accessibility

Semantic landmarks and one `h1` with a clean heading outline; skip link; native controls and `<details>`; visible 2 px
focus rings (none clipped); `<time>` for dates; external links announce "opens in a new tab"; the canvas is `aria-hidden`
and takes no pointer events; layouts reflow to 320 px with no horizontal scroll, including 200% zoom and enlarged text;
`prefers-reduced-motion` is honoured in CSS and JavaScript; contrast was measured against the real rendered pixels
(minimum 5.1:1). Playwright runs axe (WCAG 2.0/2.1 A and AA). Automation does not replace a screen-reader pass; see the
checklist below.

## Deployment

Any Node host works; it is a static-friendly Next.js app with no server runtime requirements. On Vercel, connect the
repository and set `NEXT_PUBLIC_RESUME_URL` (and `NEXT_PUBLIC_SITE_URL` if the production domain is custom).

## Before launch

**Blockers**

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production origin (the build fails without it).
- [ ] Publish a public résumé PDF with **no phone number** and set `NEXT_PUBLIC_RESUME_URL`.

**Verify (cannot be proven by the automated suite)**

- [ ] First CI run: WebKit (desktop and mobile projects) is exercised for the first time. WebGL specs on WebKit are
      opt-in (`PW_WEBKIT_WEBGL=1`) until verified.
- [ ] Open Graph card in the host's preview tool (`/opengraph-image`) and a real share to LinkedIn.
- [ ] Screen reader and real-device passes below.

### Screen reader checklist (not yet done; do not assume it passes)

*VoiceOver + Safari (macOS and iOS) and NVDA + Firefox (Windows).* For each:

- Landmarks: header, primary navigation, main, footer; one landmark per region, no duplicated "Primary" navigation read out.
- Headings: the heading list shows one h1, then h2 per section, h3 per role/project/note, h4 inside opened case studies.
- Hero: name and role read as one heading; CTAs read as links; external links announce that they open in a new tab.
- Projects: each project is an article with a title; the case-study `<details>` announces collapsed/expanded and its
  summary text; the architecture figure reads as an ordered list of stages.
- Architecture notes: each summary announces its title and state; opened content reads Why / Trade-off / Where applied.
- Experience: dates are announced sensibly (`<time>`), metrics read as a labelled list.
- Mobile menu: the Menu button announces expanded/collapsed; Escape closes it and focus returns to the button.
- The canvas is never announced.

### Real-device checklist (not yet done)

*iPhone + Safari, and Android + Chrome:* hero legibility; menu open/close and tap size; Projects scrolling smoothness;
`<details>` open/close; reduced motion (Settings → Accessibility → Reduce Motion); the résumé link; rotate to landscape and
back (menu scrolls, nothing clipped); pull-to-refresh and back-forward navigation.

*Desktop with a real GPU (Chrome, Safari, Firefox):* fish motion is smooth and unhurried; project panels slide without
popping; frame rate holds; switching tabs and returning does not jump; resizing the window keeps the canvas correct;
tier stays `high` and does not step down.

## Notes

- Fonts (Fraunces, Geist, Geist Mono) are SIL Open Font License and are self-hosted by `next/font` at build time.
- The site ships no images, models or textures. Dependencies are permissively licensed; the LGPL libvips binaries that
  Next's optional image optimizer can install are server-side and unused here.
