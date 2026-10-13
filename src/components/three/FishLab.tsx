"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { QUALITY_SETTINGS } from "@/lib/quality";
import { Environment } from "./Environment";
import { Lighting } from "./Lighting";
import { createFishGeometry } from "./fish-geometry";
import { createFishMaterial } from "./fish-material";

const settings = QUALITY_SETTINGS.high;

function LabFish({ yaw, speed }: { yaw: number; speed: number }) {
  const geometry = useMemo(() => createFishGeometry(settings.bodySegments, settings.bodyRings), []);
  const { material, uniforms } = useMemo(() => createFishMaterial({ physical: true, reflections: true }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, delta) => {
    uniforms.uTime.value += delta * speed;
  });
  return <mesh geometry={geometry} material={material} rotation={[0, yaw, 0]} frustumCulled={false} />;
}

/** Dev tool: three framings of the same fish (side, three-quarter, top) on the real lighting rig. */
export function FishLab() {
  const views = [
    { name: "side", position: [0, 0.04, 2.1] as const, yaw: 0 },
    { name: "three-quarter", position: [0.9, 0.5, 1.9] as const, yaw: -0.5 },
    { name: "top", position: [0, 2.1, 0.3] as const, yaw: 0 },
  ];
  return (
    <main className="grid min-h-screen grid-cols-1 gap-px bg-line md:grid-cols-3">
      {views.map((view) => (
        <div key={view.name} data-view={view.name} className="relative h-[60vh] bg-abyss">
          <p className="absolute left-3 top-3 z-10 font-mono text-xs text-mist">{view.name}</p>
          <Canvas camera={{ fov: 38, position: [...view.position] }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)} gl={{ antialias: true }}>
            <Lighting cursorLight={false} />
            <Environment settings={{ ...settings, lightShafts: 0 }} animate={false} />
            <LabFish yaw={view.yaw} speed={1} />
          </Canvas>
        </div>
      ))}
    </main>
  );
}
