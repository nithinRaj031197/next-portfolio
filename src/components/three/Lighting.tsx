import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type AmbientLight, type DirectionalLight, type PointLight } from "three";
import { liveIntent, sceneState } from "@/lib/scene-state";

const KEY = 1.5;
const RIM = 16;
const AMBIENT = 0.35;

/** Key, rim and (on capable devices) a soft light that follows the cursor. Intensities follow the section intent. */
export function Lighting({ cursorLight }: { cursorLight: boolean }) {
  const ambient = useRef<AmbientLight>(null);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<PointLight>(null);
  const cursor = useRef<PointLight>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (ambient.current) ambient.current.intensity = AMBIENT * (0.6 + 0.4 * liveIntent.keyLight);
    if (key.current) key.current.intensity = KEY * liveIntent.keyLight;
    if (rim.current) rim.current.intensity = RIM * liveIntent.rimLight;
    const light = cursor.current;
    if (light) {
      light.position.x = MathUtils.damp(light.position.x, sceneState.pointerX * 4.5, 3, dt);
      light.position.y = MathUtils.damp(light.position.y, sceneState.pointerY * 2.5, 3, dt);
      light.intensity = 8 * liveIntent.parallax;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={AMBIENT} color="#7fa0b5" />
      <directionalLight ref={key} position={[3, 6, 4]} intensity={KEY} color="#d6ecff" />
      <pointLight ref={rim} position={[-4, 1, -3]} intensity={RIM} distance={14} color="#7fdccf" />
      {cursorLight && <pointLight ref={cursor} position={[0, 0, 2.5]} intensity={8} distance={9} color="#9fe7f5" />}
    </>
  );
}
