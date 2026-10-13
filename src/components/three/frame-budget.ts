/**
 * Pure decision logic for the runtime quality governor, separated from the render loop so it can be unit-tested.
 * `factor` (0..1) scales DPR inside the tier; a decline also counts toward stepping the tier down.
 */
export const FRAME_BUDGET = {
  /** Seconds of frames averaged per decision. Long enough to ignore a hitch, short enough to react. */
  window: 2.5,
  /** Below this average FPS the scene is too expensive for this tier. */
  declineBelow: 45,
  /** Above this average FPS there is headroom to give DPR back. */
  inclineAbove: 57,
  declineStep: 0.34,
  inclineStep: 0.2,
  /** A single frame this long is a tab being restored or a debugger, not a measurement. */
  ignoreFrameAbove: 0.5,
} as const;

export interface BudgetDecision {
  factor: number;
  declined: boolean;
}

export function evaluateWindow(averageFps: number, factor: number): BudgetDecision {
  if (averageFps < FRAME_BUDGET.declineBelow) return { factor: Math.max(0, factor - FRAME_BUDGET.declineStep), declined: true };
  if (averageFps > FRAME_BUDGET.inclineAbove && factor < 1) return { factor: Math.min(1, factor + FRAME_BUDGET.inclineStep), declined: false };
  return { factor, declined: false };
}
