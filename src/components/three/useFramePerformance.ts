import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { FRAME_BUDGET, evaluateWindow } from "./frame-budget";

interface FramePerformanceOptions {
  /** Called only when the factor actually changes, so it can safely set React state. */
  onChange: (factor: number) => void;
  /** Called on each window that was too slow. */
  onDecline: () => void;
}

/**
 * Watches real frame times and reports slow or comfortable windows. Everything lives in a ref, so measuring never
 * re-renders; the first window is discarded because it contains shader compilation.
 */
export function useFramePerformance({ onChange, onDecline }: FramePerformanceOptions) {
  const budget = useRef({ time: 0, frames: 0, factor: 1, warm: false });

  useFrame((_, delta) => {
    const w = budget.current;
    if (delta > FRAME_BUDGET.ignoreFrameAbove) return;
    w.time += delta;
    w.frames += 1;
    if (w.time < FRAME_BUDGET.window) return;

    const fps = w.frames / w.time;
    w.time = 0;
    w.frames = 0;
    if (!w.warm) {
      w.warm = true;
      return;
    }
    const decision = evaluateWindow(fps, w.factor);
    if (decision.factor !== w.factor) {
      w.factor = decision.factor;
      onChange(decision.factor);
    }
    if (decision.declined) onDecline();
  });
}
