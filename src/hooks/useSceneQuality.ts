import { useCallback, useEffect, useRef, useState } from "react";
import { degradeTier, detectQualityTier, readQualitySignals, type QualityTier } from "@/lib/quality";

/**
 * Detects the tier once on the client, then lets the renderer step it down if frames get expensive.
 * An explicit `?quality=` override pins the tier (no runtime step-down) so QA and tests are deterministic.
 */
export function useSceneQuality(reducedMotion: boolean) {
  const [tier, setTier] = useState<QualityTier | null>(null);
  const pinned = useRef(false);

  useEffect(() => {
    // Deferred to a frame: reads window/navigator and keeps detection off the critical render path.
    const frame = requestAnimationFrame(() => {
      const signals = readQualitySignals(reducedMotion);
      pinned.current = signals.override != null;
      setTier(detectQualityTier(signals));
    });
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const degrade = useCallback(() => {
    if (!pinned.current) setTier((current) => (current ? degradeTier(current) : current));
  }, []);
  const disable = useCallback(() => setTier("none"), []);

  return { tier, degrade, disable };
}
