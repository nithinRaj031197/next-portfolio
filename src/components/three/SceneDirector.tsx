import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { FogExp2 } from "three";
import { COMPACT_MAX_WIDTH, TABLET_MAX_WIDTH, applyCompactProfile, applyTabletProfile, copyIntent, createIntent, createReducedMotionIntent, dampIntent, sampleIntent } from "@/lib/choreography";
import { liveIntent, sceneState } from "@/lib/scene-state";

/** Time constant ~0.7 s: slow enough that section changes read as drift, never as a cut. */
const INTENT_LAMBDA = 1.4;

interface SceneDirectorProps {
  animate: boolean;
}

/**
 * Turns the page position into the smoothed `liveIntent` and applies the global (non-per-object) parts of it:
 * fog density and reflection brightness. Runs before every other frame callback.
 *
 * With reduced motion it never follows scroll: the intent is pinned to the hero keyframe and snapped once.
 */
export function SceneDirector({ animate }: SceneDirectorProps) {
  const scene = useThree((state) => state.scene);
  const compact = useThree((state) => state.size.width < COMPACT_MAX_WIDTH);
  const tablet = useThree((state) => state.size.width >= COMPACT_MAX_WIDTH && state.size.width < TABLET_MAX_WIDTH);
  const target = useMemo(() => createIntent(), []);
  const reduced = useMemo(() => createReducedMotionIntent(), []);
  const snapped = useRef(false);

  useFrame((_, delta) => {
    if (animate) sampleIntent(sceneState.intentPosition, target);
    else copyIntent(target, reduced);
    if (compact) applyCompactProfile(target);
    else if (tablet) applyTabletProfile(target);
    // Phones in reduced motion get the quiet frame only: no diagram lines crossing the text.
    if (compact && !animate) target.detail = 0;

    // First frame (and every reduced-motion frame) snaps, so a reload mid-page does not fly in.
    if (!snapped.current || !animate) {
      copyIntent(liveIntent, target);
      snapped.current = true;
    } else {
      dampIntent(liveIntent, target, INTENT_LAMBDA, Math.min(delta, 0.05));
    }

    if (scene.fog) (scene.fog as FogExp2).density = liveIntent.fogDensity;
    scene.environmentIntensity = liveIntent.envIntensity;
  }, -1);

  return null;
}
