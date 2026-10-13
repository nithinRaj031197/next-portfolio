# Architecture

The decisions worth knowing before changing this codebase. Everything here is enforced by tests unless noted.

## 1. HTML first, enhancements second

The page is server-rendered semantic HTML from typed content (`src/content/*`). It is complete on its own.
Everything else is an *enhancement* that may fail without costing the visitor anything:

| Enhancement | Where | If it fails |
|---|---|---|
| WebGL scene | `components/three/*`, mounted by `SceneRoot` | No canvas; the CSS atmosphere remains |
| Scroll reveals, `#case-<id>` deep links | `MotionController` | Nothing is ever hidden (hiding is switched on last, after setup succeeds) |
| Active-section marker, mobile menu | `NavLinks`, `MobileMenu` | Links still work; no marker |
| Magnetic primary CTA | `MagneticLink` | Plain link |

Rules: content never depends on JavaScript; hiding anything for animation requires `html[data-motion="on"]`, which only
`MotionController` sets, after reduced motion is known to be off; each enhancement sits in an `EnhancementBoundary` or
fails soft internally; the 404 and error pages are plain HTML with no scene.

## 2. One lazy canvas

`SceneRoot` waits for page `load` and browser idle, picks a quality tier, then dynamic-imports `Scene` (its own ~0.9 MB
chunk). There is exactly one `<canvas>`, fixed behind the page, `aria-hidden`, with pointer events off. It is never
allowed to affect layout (fixed position, no per-scroll measurement) or interaction. Context loss unmounts it.

## 3. Scene choreography: data in, smoothed state out

```
scroll ──▶ scene-state (module store, no React state, no layout reads while scrolling)
              │  position = section index + progress, project focus weights
              ▼
        choreography.ts: one SceneIntent per section (fish lane, depth, fog, lights, camera, gallery weight),
        blended across each section boundary          ◀── pure functions, unit-tested
              ▼
        SceneDirector (priority -1): smooths the intent into `liveIntent` once per frame
              ▼
        Fish · Lighting · CameraRig · Particles · Environment · ProjectWorld   (read `liveIntent`; know nothing about the page)
```

Positions are in screen terms (NDC and distance from the camera), so "right side" stays the right side at any aspect
ratio. Layout is read only when the page resizes or its content changes (a `ResizeObserver`), never on scroll.
Per-frame code allocates nothing; scratch vectors are created once.

## 4. The project world is data

`components/three/project-world/` renders the four project diagrams as one set of merged geometries:

* `diagrams.ts`: nodes, edges and flows per project, in panel-local coordinates. Add or change a diagram here.
* `diagram-geometry.ts`: routes edges, times the pulses, and merges all four diagrams into four draw calls
  (panel bodies, lines, node quads, pulse points). There is no WebGL text and no texture or font asset.
* `layout.ts`: where each panel is, as a function of the reader's position in the HTML. Outside Projects the same four
  panels are faint ambient planes; entering Projects blends them into the gallery (nothing is swapped in).
* `lib/project-focus.ts`: maps the reading line onto the `[data-project]` articles (approach, active, departure weights).

The canvas is a spatial echo; the HTML cards and case studies are the readable source of truth.

## 5. Quality tiers

`lib/quality.ts` chooses `high | medium | low | none` from viewport, reduced motion, save-data, cores and device memory
(missing hints never penalize). A frame-budget governor lowers DPR, then steps the tier down if frames stay slow; it never
steps back up. `?quality=` pins a tier for QA. `none` is a designed page, not an error state.
High adds reflections, shafts and the cursor light; low drops panel fill, pulses, supporting nodes and effects.

## 6. Reduced motion

`prefers-reduced-motion` is honoured in CSS and JavaScript. The scene renders one composed static frame (a resting fish
pose, an understated static gallery), with no render loop, no scroll tracking, no reveals and no magnetic CTA.

## Invariants worth preserving

* No layout reads and no React state updates on scroll.
* No per-frame allocation in `useFrame` code.
* Everything created in WebGL is disposed in an effect cleanup.
* A visitor can read, navigate and contact with the scene absent, failed, reduced or JavaScript off.
* The phone number never appears in the repository, the HTML, structured data or any shipped asset.
