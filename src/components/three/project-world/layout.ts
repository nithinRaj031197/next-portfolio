import { smoothstep } from "@/lib/choreography";
import { CAMERA_REST_Z, TAN_HALF_FOV } from "../scene-constants";
import { PANEL_HEIGHT, PANEL_WIDTH } from "./diagrams";

/**
 * Where each panel is. In the gallery they form a shallow, staggered row that the reader's project position slides
 * through. Outside it they are the loose, skewed planes of Phase 4, and the two layouts are blended with the intent's
 * `gallery` weight so planes *become* panels instead of one set swapping for another.
 */

/** Phase 4's loose depth planes (world units). Index matches the project order. */
const LOOSE = [
  { x: -3.6, y: 0.4, z: -6, width: 4, height: 2.6, skew: 0.5 },
  { x: 1.4, y: -0.6, z: -9, width: 5, height: 3.2, skew: -0.4 },
  { x: 4.6, y: 1, z: -5, width: 3, height: 2.2, skew: 0.35 },
  { x: -1, y: 0.2, z: -13, width: 6, height: 3.6, skew: -0.2 },
] as const;

const STAGGER = [0.08, -0.06, 0.06, -0.04] as const;

export interface GalleryMetrics {
  /** NDC x of the active slot. Right of centre: the HTML text column is on the left. */
  activeX: number;
  /** NDC distance between neighbouring slots. */
  spacing: number;
  /** Distance from camera of the active panel's plane. */
  depth: number;
  /** Extra depth per slot away from the active one. */
  depthStep: number;
  /** How far the active panel comes forward, in world units. */
  lift: number;
  /** Panel size relative to PANEL_WIDTH x PANEL_HEIGHT. */
  scale: number;
  y: number;
}

/**
 * The active panel is larger and offset up and to the right, so it frames the HTML diagram card instead of sitting
 * directly behind it: the 3D layer is the ambient picture, the card is the readable one.
 */
export const DESKTOP_GALLERY: GalleryMetrics = { activeX: 0.74, spacing: 0.55, depth: 13.8, depthStep: 1.3, lift: 0.7, scale: 1.25, y: 0.1 };
/** One panel at a time, centred and smaller; neighbours sit a full screen away. */
/** Tablets: Projects is a single column of text, so the gallery is smaller and held to the right edge, clear of the copy. */
export const TABLET_GALLERY: GalleryMetrics = { activeX: 0.8, spacing: 0.6, depth: 14.8, depthStep: 1.2, lift: 0.5, scale: 0.62, y: 0.12 };
export const COMPACT_GALLERY: GalleryMetrics = { activeX: 0, spacing: 1, depth: 15.5, depthStep: 0.6, lift: 0.5, scale: 0.6, y: 0.1 };

/**
 * Reduced motion: nothing follows the scroll, so the gallery is one composed background. A tight, smaller row held
 * in the right half, deeper, so it never crosses the hero headline or CTAs. Compact screens keep it high and small.
 */
export const STATIC_GALLERY: GalleryMetrics = { activeX: 0.72, spacing: 0.26, depth: 17, depthStep: 0.8, lift: 0.4, scale: 0.75, y: 0 };
export const STATIC_COMPACT_GALLERY: GalleryMetrics = { activeX: 0.35, spacing: 0.3, depth: 18, depthStep: 0.8, lift: 0.3, scale: 0.55, y: 0.3 };

/** Where the previous panel retires to: mostly out of frame at the left, so it never sits behind the copy. */
const RETIRED_X = -1.15;

const peripheral = (slot: number) => smoothstep(0, 0.7, -slot);

export interface PanelPose {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  yaw: number;
  /** Panel body and border opacity. */
  opacity: number;
  /** 0..1 how much this project is the active one (inside the gallery). */
  active: number;
  /** 0..1 diagram brightness. */
  detail: number;
}

export const createPanelPose = (): PanelPose => ({ x: 0, y: 0, z: 0, width: 1, height: 1, yaw: 0, opacity: 0, active: 0, detail: 0 });

export interface LayoutInput {
  /** Continuous project position (0..N-1). */
  position: number;
  /** Per-project weights, summing to 1. */
  weights: ArrayLike<number>;
  gallery: number;
  alignment: number;
  structure: number;
  textDensity: number;
  detail: number;
  aspect: number;
  compact: boolean;
  /** Fixed composition for reduced motion (ignores the scroll-driven slot sliding). */
  isStatic?: boolean;
  /** 768 to 1099 px wide. */
  tablet?: boolean;
  /** Multiplier on panel opacity (phones in reduced motion show the gallery at half strength). */
  opacityScale?: number;
  /** Multiplier on the loose-plane opacity outside the gallery (0 hides them, e.g. on the low tier). */
  looseVisibility: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function computePanelPose(index: number, input: LayoutInput, out: PanelPose) {
  const loose = LOOSE[index] ?? LOOSE[0];
  const metrics = input.isStatic ? (input.compact ? STATIC_COMPACT_GALLERY : STATIC_GALLERY) : input.compact ? COMPACT_GALLERY : input.tablet ? TABLET_GALLERY : DESKTOP_GALLERY;
  const g = smoothstep(0, 1, input.gallery);
  const weight = input.weights[index] ?? 0;
  const slot = index - input.position;

  // Panels behind the reader (slot < 0) retire: deeper, toward the left edge, and much quieter. Panels ahead stay visible.
  const retired = input.isStatic ? 0 : peripheral(slot);
  const ahead = input.isStatic ? 0 : smoothstep(0, 1, slot);
  const depth = metrics.depth + Math.min(Math.abs(slot), 2) * metrics.depthStep + retired * 1.8 - weight * metrics.lift;
  const halfHeight = TAN_HALF_FOV * depth;
  const slotX = metrics.activeX + slot * metrics.spacing;
  const ndcX = input.compact || input.isStatic ? slotX : lerp(slotX, Math.min(slotX, RETIRED_X), retired);
  const galleryX = ndcX * halfHeight * input.aspect;
  const galleryY = (metrics.y + (input.compact && !input.isStatic ? 0 : STAGGER[index] ?? 0)) * halfHeight;

  out.x = lerp(loose.x, galleryX, g);
  out.y = lerp(loose.y, galleryY, g);
  out.z = lerp(loose.z, CAMERA_REST_Z - depth, g);
  out.width = lerp(loose.width, PANEL_WIDTH * metrics.scale, g);
  out.height = lerp(loose.height, PANEL_HEIGHT * metrics.scale, g);
  // Panels left of the active one turn slightly toward it, so the row reads as a shallow curve.
  out.yaw = lerp(loose.skew * (1 - input.alignment), Math.max(-0.2, Math.min(0.2, -slot * 0.07)), g);

  const looseOpacity = input.structure * (1 - input.textDensity * 0.55) * 0.8 * input.looseVisibility;
  // Inactive panels keep real presence (0.45) so the sequence stays legible; the active one is fuller.
  const galleryOpacity = (0.4 + 0.6 * weight) * 0.9 * lerp(1, 0.3, retired) * lerp(1, 0.85, ahead);
  out.opacity = lerp(looseOpacity, galleryOpacity, g) * (input.opacityScale ?? 1);
  out.active = weight * g;
  // Diagram brightness: strongest on the active panel, restrained ahead, nearly gone behind.
  out.detail = input.detail * lerp(1, 0.08, retired) * lerp(1, 0.6, ahead);
}
