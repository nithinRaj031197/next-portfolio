/**
 * Maps the page reading line onto the four project articles (`[data-project]` in the HTML), as a continuous
 * project position plus per-project weights. The weights have a wide plateau (active), shoulders (approach and
 * departure) and overlap neighbours, so the active project never flips on a few pixels of scroll.
 */

/** Same ids and order as the semantic project articles (`data-project`) and `src/content/projects.ts`. */
export const PROJECT_IDS = ["ai-console", "workflow-builder", "vehicle-ops", "federation"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

export interface ProjectFocus {
  /** Continuous project index, 0..N-1, from interpolating the reading line between article centres. */
  position: number;
  /** Per-project weights, summing to 1. */
  weights: number[];
}

export const createProjectFocus = (): ProjectFocus => ({ position: 0, weights: PROJECT_IDS.map((_, i) => (i === 0 ? 1 : 0)) });

/** Neutral state used for the static (reduced-motion) composition: no project is favoured. */
export const STATIC_PROJECT_FOCUS: Readonly<ProjectFocus> = { position: 1.5, weights: PROJECT_IDS.map(() => 1 / PROJECT_IDS.length) };

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Distance (in projects) within which a project is fully active, and beyond which it is not active at all. */
const PLATEAU = 0.25;
const REACH = 0.9;

export function projectPosition(line: number, centers: readonly number[]): number {
  const last = centers.length - 1;
  if (last < 0 || line <= centers[0]!) return 0;
  for (let i = 0; i < last; i++) {
    const start = centers[i]!;
    const end = centers[i + 1]!;
    if (line < end) return i + (line - start) / Math.max(end - start, 1);
  }
  return last;
}

export function projectWeights(position: number, out: number[]) {
  let total = 0;
  for (let i = 0; i < out.length; i++) {
    out[i] = smooth(REACH, PLATEAU, Math.abs(position - i));
    total += out[i]!;
  }
  // total > 0 always: the nearest project is within REACH of any position in [0, N-1].
  for (let i = 0; i < out.length; i++) out[i] = out[i]! / total;
}

export function writeProjectFocus(line: number, centers: readonly number[], out: ProjectFocus) {
  out.position = projectPosition(line, centers);
  projectWeights(out.position, out.weights);
}

/** Index of the dominant project, or -1 if none stands out clearly. */
export function dominantProject(weights: readonly number[], threshold = 0.5): number {
  let best = -1;
  let bestWeight = threshold;
  // A plain loop: this runs every frame, so no closure per call.
  for (let i = 0; i < weights.length; i++) {
    if (weights[i]! > bestWeight) {
      best = i;
      bestWeight = weights[i]!;
    }
  }
  return best;
}
