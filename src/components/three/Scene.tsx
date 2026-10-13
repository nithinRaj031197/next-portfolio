import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { QUALITY_SETTINGS, type RenderTier } from "@/lib/quality";
import { trackSceneState } from "@/lib/scene-state";
import { CameraRig } from "./CameraRig";
import { Environment } from "./Environment";
import { Fish } from "./Fish";
import { Lighting } from "./Lighting";
import { Particles } from "./Particles";
import { useFramePerformance } from "./useFramePerformance";
import { SceneDirector } from "./SceneDirector";
import { CAMERA_REST_Z, FOV } from "./scene-constants";
import { ProjectWorld } from "./project-world/ProjectWorld";

interface SceneProps {
  tier: RenderTier;
  reducedMotion: boolean;
  /** Step the quality tier down because frames are consistently expensive. */
  onDegrade: () => void;
  /** Give up on WebGL (context lost); the CSS atmosphere remains. */
  onUnavailable: () => void;
}

/** Declines (each ~2.5 s of slow frames) tolerated before the tier is lowered. */
const DECLINES_BEFORE_DEGRADE = 2;

interface FrameGovernorProps {
  onFactor: (factor: number) => void;
  onDegrade: () => void;
}

/** Lives inside the Canvas (it needs the render loop): reports DPR headroom and, after repeated slow windows, asks to lower the tier. */
function FrameGovernor({ onFactor, onDegrade }: FrameGovernorProps) {
  const declines = useRef(0);
  useFramePerformance({
    onChange: onFactor,
    onDecline: () => {
      declines.current += 1;
      if (declines.current >= DECLINES_BEFORE_DEGRADE) {
        declines.current = 0;
        onDegrade();
      }
    },
  });
  return null;
}

/**
 * The single global canvas. Fixed behind the page, transparent so the CSS atmosphere shows through,
 * hidden from assistive tech and never receives pointer events.
 */
export default function Scene({ tier, reducedMotion, onDegrade, onUnavailable }: SceneProps) {
  const settings = QUALITY_SETTINGS[tier];
  const animate = !reducedMotion;
  const [ready, setReady] = useState(false);
  const [factor, setFactor] = useState(1);
  // Removes the context-loss listener when the canvas unmounts (the element is discarded, but nothing stays attached).
  const detachContextLoss = useRef<(() => void) | null>(null);

  useEffect(() => trackSceneState({ scroll: animate, pointer: animate && tier !== "low" }), [animate, tier]);
  useEffect(() => () => detachContextLoss.current?.(), []);

  // The governor's factor (0..1) moves the DPR within the tier's range before the tier itself drops.
  const dpr = MathUtils.lerp(settings.dpr[0], settings.dpr[1], factor);

  return (
    <div
      aria-hidden
      data-scene
      data-quality={tier}
      data-motion={animate ? "full" : "reduced"}
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[1400ms] ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <Canvas
        dpr={dpr}
        // The canvas is position: fixed, so scrolling never changes its bounds: skip react-use-measure's per-scroll layout read.
        resize={{ scroll: false }}
        frameloop={animate ? "always" : "demand"}
        camera={{ fov: FOV, position: [0, 0, CAMERA_REST_Z], near: 0.1, far: 40 }}
        gl={{ antialias: settings.antialias, alpha: true, powerPreference: tier === "high" ? "high-performance" : "default" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          // A lost context is not worth fighting for decoration: drop the canvas and keep the CSS atmosphere.
          const onLost = (event: Event) => {
            event.preventDefault();
            onUnavailable();
          };
          canvas.addEventListener("webglcontextlost", onLost);
          detachContextLoss.current = () => canvas.removeEventListener("webglcontextlost", onLost);
          setReady(true);
        }}
      >
        {animate && <FrameGovernor onFactor={setFactor} onDegrade={onDegrade} />}
        <Suspense fallback={null}>
          <SceneDirector animate={animate} />
          <CameraRig animate={animate} />
          <Lighting cursorLight={settings.cursorLight && animate} />
          <Environment settings={settings} animate={animate} />
          <Particles count={settings.particles} animate={animate} />
          <Fish settings={settings} reducedMotion={reducedMotion} />
          <ProjectWorld settings={settings} animate={animate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
