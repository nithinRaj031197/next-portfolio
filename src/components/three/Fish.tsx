import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector3, type Group } from "three";
import { KEYFRAMES, STATIC_FISH_POSE, STATIC_FISH_POSE_COMPACT, readabilityFactor } from "@/lib/choreography";
import type { QualitySettings } from "@/lib/quality";
import { liveIntent } from "@/lib/scene-state";
import { createFishGeometry } from "./fish-geometry";
import { createFishMaterial } from "./fish-material";
import { CAMERA_REST_Z, TAN_HALF_FOV } from "./scene-constants";
import { angleDelta, bankFromYawRate, wobble } from "./swim";

/** Orbit period at speed 1: about 70 s, so the fish is discovered rather than watched. */
const BASE_ANGULAR_SPEED = (Math.PI * 2) / 70;
/** Phase of the orbit used for the single static frame when motion is reduced. */
const REST_PHASE = 5.2;
const REST_TIME = 1.1;
const BASE_SCALE = 0.85;
const HEADING_LAMBDA = 3;
/** Never dimmer than this: recognizable when noticed, still ignorable when reading. */
const MIN_INTENSITY = 0.22;

interface FishProps {
  settings: QualitySettings;
  reducedMotion: boolean;
}

/**
 * Procedural fish. The body bends in the vertex shader (fish-material.ts). This component places the whole fish
 * on an elliptical orbit around the current *lane* (liveIntent: where on screen, how deep, how wide) and
 * orients it along its direction of travel. It knows nothing about the page: lanes come from the choreography.
 */
export function Fish({ settings, reducedMotion }: FishProps) {
  const group = useRef<Group>(null);
  const aspect = useThree((state) => state.size.width / state.size.height);
  const compact = useThree((state) => state.size.width < 768);
  const staticPose = compact ? STATIC_FISH_POSE_COMPACT : STATIC_FISH_POSE;

  const geometry = useMemo(() => createFishGeometry(settings.bodySegments, settings.bodyRings), [settings.bodySegments, settings.bodyRings]);
  const { material, uniforms } = useMemo(
    () => createFishMaterial({ physical: settings.physicalMaterial, reflections: settings.reflections }),
    [settings.physicalMaterial, settings.reflections],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // Everything the frame loop touches is allocated once here.
  const frame = useMemo(
    () => ({
      time: 0,
      phase: REST_PHASE,
      waveTime: REST_TIME,
      yaw: 0,
      roll: 0,
      intensity: 1,
      seeded: false,
      position: new Vector3(),
      previous: new Vector3(),
      velocity: new Vector3(),
      heading: new Vector3(1, 0, 0),
      ndcX: 0,
    }),
    [],
  );

  /** Writes the fish position for an orbit `phase` at `time` into `out`; records its NDC x for readability. */
  const evaluate = (phase: number, time: number, out: Vector3) => {
    const lane = liveIntent;
    if (reducedMotion) {
      // Composed static pose (not a frozen orbit): the depth follows the compact profile via the hero depth ratio.
      const depth = staticPose.depth * (lane.depth / KEYFRAMES.hero.depth);
      const halfHeight = TAN_HALF_FOV * depth;
      frame.ndcX = staticPose.ndcX;
      out.set(staticPose.ndcX * halfHeight * aspect, staticPose.ndcY * halfHeight, CAMERA_REST_Z - depth);
      return;
    }
    const depth = lane.depth + lane.orbitDepth * Math.sin(phase);
    const halfHeight = TAN_HALF_FOV * depth;
    const ndcX = lane.laneX + lane.orbitX * Math.cos(phase);
    const ndcY = lane.laneY + lane.orbitY * Math.sin(phase * 0.7 + 1) + 0.03 * Math.sin(time * 0.37) + 0.012 * Math.sin(time * 1.1);
    frame.ndcX = ndcX;
    out.set(ndcX * halfHeight * aspect, ndcY * halfHeight, CAMERA_REST_Z - depth);
  };

  useFrame((_, delta) => {
    const target = group.current;
    if (!target) return;
    // Clamped so a backgrounded tab does not teleport the fish when it resumes.
    const dt = reducedMotion ? 0 : Math.min(delta, 0.05);

    if (dt > 0) {
      frame.time += dt;
      frame.phase += dt * BASE_ANGULAR_SPEED * liveIntent.speed * wobble(frame.time, 0.2);
      frame.waveTime += dt * (0.75 + 0.45 * liveIntent.speed);
    }
    const time = reducedMotion ? REST_TIME : frame.time;
    evaluate(reducedMotion ? REST_PHASE : frame.phase, time, frame.position);

    if (!frame.seeded || reducedMotion) {
      if (reducedMotion) {
        const [hx, hy, hz] = staticPose.heading;
        frame.heading.set(hx, hy, hz).normalize();
      } else {
        // Seed the heading from the analytic direction of travel (a tiny step ahead on the orbit).
        evaluate(frame.phase + 0.02, time, frame.velocity);
        frame.heading.copy(frame.velocity).sub(frame.position).normalize();
      }
      frame.yaw = Math.atan2(-frame.heading.z, frame.heading.x);
      frame.seeded = true;
      evaluate(reducedMotion ? REST_PHASE : frame.phase, time, frame.position);
    } else if (dt > 0) {
      frame.velocity.copy(frame.position).sub(frame.previous).divideScalar(dt).normalize();
      frame.heading.lerp(frame.velocity, 1 - Math.exp(-HEADING_LAMBDA * dt)).normalize();
    }
    frame.previous.copy(frame.position);

    const yaw = Math.atan2(-frame.heading.z, frame.heading.x);
    const pitch = MathUtils.clamp(Math.asin(MathUtils.clamp(frame.heading.y, -1, 1)), -0.3, 0.3);
    if (dt > 0) {
      const bank = bankFromYawRate(angleDelta(frame.yaw, yaw) / dt, 0.9 * wobble(frame.time, 0.15, 2));
      frame.roll = MathUtils.damp(frame.roll, bank, 2.5, dt);
    }
    frame.yaw = yaw;

    target.position.copy(frame.position);
    // YZX: yaw about world Y, then pitch about Z, then roll about the fish's own forward axis.
    target.rotation.set(frame.roll, yaw, pitch, "YZX");

    // Section-aware readability: dim while crossing the section's text column, then ease back.
    const wanted = Math.max(liveIntent.fishIntensity * readabilityFactor(frame.ndcX, liveIntent), MIN_INTENSITY);
    frame.intensity = reducedMotion ? wanted : MathUtils.damp(frame.intensity, wanted, 3, Math.min(delta, 0.05));
    uniforms.uIntensity.value = frame.intensity;
    uniforms.uTime.value = frame.waveTime;
    uniforms.uAmp.value = wobble(time, 0.1, 4);
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} scale={BASE_SCALE} frustumCulled={false} />
    </group>
  );
}
