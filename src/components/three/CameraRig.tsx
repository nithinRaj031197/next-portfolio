import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { smoothstep } from "@/lib/choreography";
import { PROJECT_IDS } from "@/lib/project-focus";
import { liveIntent, sceneState } from "@/lib/scene-state";
import { CAMERA_REST_Z } from "./scene-constants";

/** Pointer parallax in scene units: a couple of centimetres' worth, never a visible camera move. */
const PARALLAX_X = 0.12;
const PARALLAX_Y = 0.07;
/** Across the whole gallery the camera shifts by about +-0.14 units: a hint of parallax between projects, not a pan. */
const PROJECT_SHIFT_X = 0.09;
const PROJECT_SHIFT_TARGET = 0.12;
const PROJECT_MIDPOINT = (PROJECT_IDS.length - 1) / 2;

/**
 * One lens, one continuous environment. Position is the section's tiny offset (liveIntent.camera*) plus a little
 * pointer parallax. FOV never changes. When `animate` is false the camera is never touched.
 */
export function CameraRig({ animate }: { animate: boolean }) {
  useFrame((state, delta) => {
    if (!animate) return;
    const dt = Math.min(delta, 0.05);
    const { camera } = state;
    const parallax = liveIntent.parallax;
    const gallery = smoothstep(0, 1, liveIntent.gallery);
    const projectOffset = (sceneState.projects.position - PROJECT_MIDPOINT) * gallery;
    camera.position.x = MathUtils.damp(camera.position.x, liveIntent.cameraX + projectOffset * PROJECT_SHIFT_X + sceneState.pointerX * PARALLAX_X * parallax, 2, dt);
    camera.position.y = MathUtils.damp(camera.position.y, liveIntent.cameraY + sceneState.pointerY * PARALLAX_Y * parallax, 2, dt);
    camera.position.z = MathUtils.damp(camera.position.z, CAMERA_REST_Z - liveIntent.cameraZ, 2, dt);
    camera.lookAt(projectOffset * PROJECT_SHIFT_TARGET, 0, 0);
  });

  return null;
}
