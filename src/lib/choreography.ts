/**
 * Scene choreography as data. The 3D layer never looks at the page: it reads a `SceneIntent`
 * that is blended between neighbouring sections from one continuous position along the page.
 *
 *   scroll → sectionPosition() → sampleIntent() → (SceneDirector smoothing) → liveIntent → components
 *
 * Positions are expressed in screen terms (NDC x/y, distance from camera) rather than pixels or world
 * units, so "right side" stays the right side at any aspect ratio.
 */

export const SECTION_IDS = ["hero", "about", "experience", "projects", "architecture", "skills", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** DOM anchor of each section. Only the scroll tracker uses this. */
export const SECTION_ELEMENT_ID: Record<SectionId, string> = {
  hero: "top",
  about: "about",
  experience: "experience",
  projects: "projects",
  architecture: "architecture",
  skills: "skills",
  contact: "contact",
};

export interface SceneIntent {
  /** Centre of the fish's lane in NDC (-1..1, y up). */
  laneX: number;
  laneY: number;
  /** Distance from the camera to the lane. Larger is deeper, smaller and foggier. */
  depth: number;
  /** Orbit extents around the lane: NDC radii and a depth swing in world units. */
  orbitX: number;
  orbitY: number;
  orbitDepth: number;
  /** Multiplier on swim speed. */
  speed: number;
  /** 0..1 fish brightness before readability attenuation. */
  fishIntensity: number;
  /** 0..1 how dense the text is behind the scene in this section. */
  textDensity: number;
  /** NDC x-range where that text lives; the fish dims while inside it. */
  columnStart: number;
  columnEnd: number;
  fogDensity: number;
  particleOpacity: number;
  /** Fraction of particles shown (sparser as it drops). */
  particleDensity: number;
  shaftOpacity: number;
  envIntensity: number;
  keyLight: number;
  rimLight: number;
  /** Camera offsets from rest, in scene units (centimetre-scale on purpose). */
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  /** Multiplier on pointer parallax. */
  parallax: number;
  /** 0..1 opacity of the faint depth planes that foreshadow the project world. */
  structure: number;
  /** 0 = planes skewed, 1 = planes squared up. */
  alignment: number;
  /** 0..1 how far the loose planes have become the project gallery (panels, diagrams). */
  gallery: number;
  /** 0..1 brightness of the diagrams inside the gallery panels. */
  detail: number;
}

export const INTENT_KEYS = [
  "laneX", "laneY", "depth", "orbitX", "orbitY", "orbitDepth", "speed", "fishIntensity", "textDensity", "columnStart", "columnEnd",
  "fogDensity", "particleOpacity", "particleDensity", "shaftOpacity", "envIntensity", "keyLight", "rimLight",
  "cameraX", "cameraY", "cameraZ", "parallax", "structure", "alignment", "gallery", "detail",
] as const satisfies readonly (keyof SceneIntent)[];

const intent = (values: SceneIntent): SceneIntent => values;

export const KEYFRAMES: Record<SectionId, SceneIntent> = {
  // Close, right-weighted and above the "at a glance" card; clear of the left text column.
  hero: intent({
    laneX: 0.55, laneY: 0.62, depth: 5.4, orbitX: 0.2, orbitY: 0.08, orbitDepth: 0.9, speed: 1, fishIntensity: 0.95,
    textDensity: 0.6, columnStart: -0.8, columnEnd: 0.05,
    fogDensity: 0.05, particleOpacity: 1, particleDensity: 1, shaftOpacity: 0.07, envIntensity: 0.9, keyLight: 1, rimLight: 1,
    cameraX: 0.1, cameraY: 0.03, cameraZ: 0, parallax: 1, structure: 0, alignment: 0, gallery: 0, detail: 0,
  }),
  // Distant upper-right silhouette; slower, dimmer, foggier.
  about: intent({
    laneX: 0.72, laneY: 0.3, depth: 9.5, orbitX: 0.12, orbitY: 0.08, orbitDepth: 1.2, speed: 0.6, fishIntensity: 0.6,
    textDensity: 0.5, columnStart: -0.8, columnEnd: 0.3,
    fogDensity: 0.075, particleOpacity: 0.8, particleDensity: 0.8, shaftOpacity: 0.06, envIntensity: 0.8, keyLight: 0.85, rimLight: 0.8,
    cameraX: 0.06, cameraY: 0.02, cameraZ: 0.05, parallax: 0.6, structure: 0, alignment: 0, gallery: 0, detail: 0,
  }),
  // Right margin, swinging through depth rather than across the timeline.
  experience: intent({
    laneX: 0.86, laneY: -0.1, depth: 10.5, orbitX: 0.06, orbitY: 0.22, orbitDepth: 2.2, speed: 0.7, fishIntensity: 0.55,
    textDensity: 0.9, columnStart: -0.8, columnEnd: 0.8,
    fogDensity: 0.07, particleOpacity: 0.7, particleDensity: 0.7, shaftOpacity: 0.05, envIntensity: 0.75, keyLight: 0.8, rimLight: 0.7,
    cameraX: 0.03, cameraY: 0, cameraZ: 0.1, parallax: 0.5, structure: 0.1, alignment: 0, gallery: 0, detail: 0,
  }),
  // The project gallery: the fish drops well behind the panels (depth 19 vs panels at ~13-16), so it can only ever
  // pass between or behind them, never in front of a diagram. The camera squares up.
  projects: intent({
    laneX: 0.15, laneY: 0.3, depth: 19, orbitX: 0.1, orbitY: 0.06, orbitDepth: 1.2, speed: 0.4, fishIntensity: 0.4,
    textDensity: 0.9, columnStart: -0.8, columnEnd: 0.8,
    fogDensity: 0.062, particleOpacity: 0.6, particleDensity: 0.6, shaftOpacity: 0.05, envIntensity: 0.85, keyLight: 0.9, rimLight: 0.8,
    cameraX: 0, cameraY: -0.02, cameraZ: 0.2, parallax: 0.35, structure: 0.55, alignment: 0.3, gallery: 1, detail: 1,
  }),
  // Left edge; planes square up, particles thin out, key light picks out depth.
  architecture: intent({
    laneX: -0.88, laneY: 0.2, depth: 12.5, orbitX: 0.06, orbitY: 0.18, orbitDepth: 1.8, speed: 0.45, fishIntensity: 0.4,
    textDensity: 0.8, columnStart: -0.8, columnEnd: 0.8,
    fogDensity: 0.06, particleOpacity: 0.5, particleDensity: 0.4, shaftOpacity: 0.04, envIntensity: 1, keyLight: 1.05, rimLight: 0.75,
    cameraX: 0, cameraY: -0.03, cameraZ: 0.15, parallax: 0.3, structure: 0.9, alignment: 1, gallery: 0, detail: 0,
  }),
  // The quietest section: far background, almost no parallax.
  skills: intent({
    laneX: 0.65, laneY: 0.45, depth: 16, orbitX: 0.08, orbitY: 0.05, orbitDepth: 1, speed: 0.35, fishIntensity: 0.3,
    textDensity: 0.8, columnStart: -0.8, columnEnd: 0.8,
    fogDensity: 0.085, particleOpacity: 0.45, particleDensity: 0.5, shaftOpacity: 0.03, envIntensity: 0.7, keyLight: 0.7, rimLight: 0.6,
    cameraX: 0, cameraY: 0, cameraZ: 0.1, parallax: 0.15, structure: 0.25, alignment: 1, gallery: 0, detail: 0,
  }),
  // More intimate framing and one slow background pass along the bottom.
  contact: intent({
    laneX: 0, laneY: -0.6, depth: 9.5, orbitX: 0.55, orbitY: 0.05, orbitDepth: 1.4, speed: 0.6, fishIntensity: 0.6,
    textDensity: 0.5, columnStart: -0.8, columnEnd: 0.1,
    fogDensity: 0.055, particleOpacity: 0.85, particleDensity: 0.8, shaftOpacity: 0.06, envIntensity: 0.9, keyLight: 0.95, rimLight: 0.9,
    cameraX: -0.05, cameraY: 0.02, cameraZ: -0.12, parallax: 0.7, structure: 0.1, alignment: 1, gallery: 0, detail: 0,
  }),
};

/**
 * Reduced motion: one deliberately composed static frame. The hero lane, plus a calm, understated version of the
 * project gallery (four shallow panels, diagrams barely lit) because nothing follows the scroll.
 */
export const REDUCED_MOTION_OVERRIDES: Partial<SceneIntent> = { gallery: 0.85, detail: 0.35, structure: 0.5, alignment: 1 };

/**
 * Composed resting pose for the fish when motion is reduced: upper right, clear of the hero text and the "at a glance"
 * card at any viewport, swimming gently toward the content. Not a frozen frame of the animated orbit.
 */
export const STATIC_FISH_POSE = { ndcX: 0.64, ndcY: 0.62, depth: 6.6, heading: [-1, 0.1, -0.25] } as const;

/** Phones: the only free band is between the header and the hero eyebrow, so the fish rests there, small and far. */
export const STATIC_FISH_POSE_COMPACT = { ndcX: 0.5, ndcY: 0.77, depth: 6.6, heading: [-1, 0.05, -0.2] } as const;

export const createIntent = (source: SceneIntent = KEYFRAMES.hero): SceneIntent => ({ ...source });

export function createReducedMotionIntent(): SceneIntent {
  return { ...KEYFRAMES.hero, ...REDUCED_MOTION_OVERRIDES };
}

export function copyIntent(target: SceneIntent, source: SceneIntent) {
  for (const key of INTENT_KEYS) target[key] = source[key];
}

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Continuous position along the page. Integer part = section index, fraction = how far through it.
 * `anchors` are the section tops plus a final end value (N + 1 numbers); `line` is the reading line.
 */
export function sectionPosition(line: number, anchors: readonly number[]): number {
  const count = anchors.length - 1;
  if (count < 1 || line <= anchors[0]!) return 0;
  for (let i = 0; i < count; i++) {
    const start = anchors[i]!;
    const end = anchors[i + 1]!;
    if (line < end) return i + (line - start) / Math.max(end - start, 1);
  }
  return count;
}

/**
 * Intent position: a section holds its own intent, and each boundary between sections is crossed by a transition
 * of `blendPx` pixels *centred on the boundary*, so a section keeps its intent for its whole body and the change
 * straddles the seam. Each boundary contributes 0..1, so the sum is "sections crossed" (an index plus a fraction)
 * and is continuous and monotonic. A transition never reaches further than half of either neighbouring section.
 */
export function blendedPosition(line: number, anchors: readonly number[], blendPx: number): number {
  const count = anchors.length - 1;
  let value = 0;
  for (let j = 1; j < count; j++) {
    const before = anchors[j]! - anchors[j - 1]!;
    const after = anchors[j + 1]! - anchors[j]!;
    const half = Math.max(Math.min(blendPx / 2, before / 2, after / 2), 0.5);
    value += Math.min(Math.max((line - (anchors[j]! - half)) / (2 * half), 0), 1);
  }
  return value;
}

/**
 * Samples the intent at an intent position (see `blendedPosition`): the fractional part is how far section i has
 * eased into section i + 1, so the result is the section's own keyframe except inside a transition.
 */
export function sampleIntent(position: number, out: SceneIntent) {
  const last = SECTION_IDS.length - 1;
  const clamped = Math.min(Math.max(position, 0), last);
  const index = Math.min(Math.floor(clamped), last);
  const from = KEYFRAMES[SECTION_IDS[index]!];
  if (index === last) return copyIntent(out, from);
  const to = KEYFRAMES[SECTION_IDS[index + 1]!];
  const weight = smoothstep(0, 1, clamped - index);
  for (const key of INTENT_KEYS) out[key] = from[key] + (to[key] - from[key]) * weight;
}

/** Per-section progress/active flags, written into a preallocated array. */
export function writeSectionStates(position: number, out: { progress: number; active: boolean }[]) {
  out.forEach((section, i) => {
    section.progress = Math.min(Math.max(position - i, 0), 1);
    section.active = position >= i && position < i + 1;
  });
}

/** Moves every field toward `target` with frame-rate independent exponential smoothing. */
export function dampIntent(current: SceneIntent, target: SceneIntent, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt);
  for (const key of INTENT_KEYS) current[key] += (target[key] - current[key]) * k;
}

/** Viewport widths (px) below which the scene is simplified. Phones: under 768. Tablets: 768 to 1099. */
export const COMPACT_MAX_WIDTH = 768;
export const TABLET_MAX_WIDTH = 1100;

/** Tablets keep the full composition but with less WebGL dominance: a calmer fish, dimmer diagrams, less parallax. */
export const TABLET_PROFILE = { intensity: 0.8, detail: 0.35, parallax: 0.6, particles: 0.8 } as const;

export function applyTabletProfile(intent: SceneIntent) {
  const p = TABLET_PROFILE;
  intent.fishIntensity *= p.intensity;
  intent.detail *= p.detail;
  intent.parallax *= p.parallax;
  intent.particleDensity *= p.particles;
}

/** Scales an intent for small screens: farther, dimmer, calmer, almost no camera or parallax movement. */
export const COMPACT_PROFILE = { depth: 2, orbit: 0.5, intensity: 0.5, camera: 0.35, parallax: 0.3, particles: 0.7 } as const;

export function applyCompactProfile(intent: SceneIntent) {
  const p = COMPACT_PROFILE;
  intent.depth *= p.depth;
  intent.orbitX *= p.orbit;
  intent.orbitY *= p.orbit;
  intent.orbitDepth *= p.orbit;
  intent.fishIntensity *= p.intensity;
  intent.cameraX *= p.camera;
  intent.cameraY *= p.camera;
  intent.cameraZ *= p.camera;
  intent.parallax *= p.parallax;
  intent.particleDensity *= p.particles;
  intent.detail *= 0.2;
  // Phones: keep the fish in the empty band under the header, never beside a heading or a CTA.
  intent.laneY = 0.78;
  intent.orbitY *= 0.5;
  // On a phone, text spans the full width, so the whole width is the reading column and the fish stays ambient.
  intent.columnStart = -1.05;
  intent.columnEnd = 1.05;
  intent.textDensity = Math.max(intent.textDensity, 0.85);
}

/** 1 = fully visible, lower while the fish sits in the section's text column. */
export function readabilityFactor(ndcX: number, intent: SceneIntent) {
  const edge = 0.12;
  const inside = smoothstep(intent.columnStart - edge, intent.columnStart + edge, ndcX) * (1 - smoothstep(intent.columnEnd - edge, intent.columnEnd + edge, ndcX));
  return 1 - intent.textDensity * 0.7 * inside;
}
