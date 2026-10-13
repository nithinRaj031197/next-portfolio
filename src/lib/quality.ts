export type QualityTier = "high" | "medium" | "low" | "none";
export type RenderTier = Exclude<QualityTier, "none">;

/** Inputs to tier selection. Hardware hints are hints, not truth: missing values never penalize. */
export interface QualitySignals {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** Viewport width in CSS px. */
  width: number;
  cores?: number;
  /** navigator.deviceMemory (GB, capped at 8 by the spec). Unavailable in Safari and Firefox. */
  memory?: number;
  /** Explicit override, e.g. from ?quality=low. */
  override?: QualityTier | null;
}

export interface QualitySettings {
  dpr: [min: number, max: number];
  particles: number;
  lightShafts: number;
  /** Project world: panel fill/sheen, moving pulses, and whether supporting nodes are drawn. */
  projectWorld: { fill: boolean; pulses: boolean; essentialOnly: boolean };
  bodySegments: number;
  bodyRings: number;
  /** Procedural reflections for the fish (PMREM of a few light panels). */
  reflections: boolean;
  /** Point light that follows the cursor. */
  cursorLight: boolean;
  /** MeshPhysicalMaterial (clearcoat) instead of MeshStandardMaterial. */
  physicalMaterial: boolean;
  antialias: boolean;
}

export const QUALITY_SETTINGS: Record<RenderTier, QualitySettings> = {
  high: { dpr: [1, 2], particles: 160, lightShafts: 3, projectWorld: { fill: true, pulses: true, essentialOnly: false }, bodySegments: 56, bodyRings: 28, reflections: true, cursorLight: true, physicalMaterial: true, antialias: true },
  medium: { dpr: [1, 1.5], particles: 90, lightShafts: 2, projectWorld: { fill: true, pulses: true, essentialOnly: false }, bodySegments: 36, bodyRings: 18, reflections: true, cursorLight: false, physicalMaterial: true, antialias: true },
  low: { dpr: [1, 1], particles: 36, lightShafts: 0, projectWorld: { fill: false, pulses: false, essentialOnly: true }, bodySegments: 22, bodyRings: 10, reflections: false, cursorLight: false, physicalMaterial: false, antialias: false },
};

const ORDER: QualityTier[] = ["high", "medium", "low", "none"];

export const isQualityTier = (value: string | null | undefined): value is QualityTier => ORDER.includes(value as QualityTier);

/** One step down. `none` removes the canvas and leaves the CSS atmosphere. */
export function degradeTier(tier: QualityTier): QualityTier {
  return ORDER[Math.min(ORDER.indexOf(tier) + 1, ORDER.length - 1)] ?? "none";
}

const capAt = (tier: QualityTier, cap: QualityTier): QualityTier => ORDER[Math.max(ORDER.indexOf(tier), ORDER.indexOf(cap))] ?? tier;

export function detectQualityTier(signals: QualitySignals): QualityTier {
  if (signals.override) return signals.override;
  if (!signals.webgl) return "none";

  let tier: QualityTier;
  if (signals.saveData || signals.width < 768) tier = "low";
  else if (signals.width < 1100) tier = "medium";
  else if ((signals.cores ?? 8) >= 8 && (signals.memory ?? 8) >= 8) tier = "high";
  else if ((signals.cores ?? 8) >= 4 && (signals.memory ?? 8) >= 4) tier = "medium";
  else tier = "low";

  // A static scene is cheap to render, but there is no reason to pay for the top tier either.
  return signals.reducedMotion ? capAt(tier, "medium") : tier;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

export function readQualitySignals(reducedMotion: boolean): QualitySignals {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const requested = new URLSearchParams(window.location.search).get("quality");
  return {
    webgl: hasWebGL(),
    reducedMotion,
    saveData: nav.connection?.saveData === true,
    width: window.innerWidth,
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    override: isQualityTier(requested) ? requested : null,
  };
}
