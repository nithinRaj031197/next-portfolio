import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AdditiveBlending, Color, DoubleSide, Mesh, MeshBasicMaterial, PMREMGenerator, PlaneGeometry, Scene, ShaderMaterial } from "three";
import type { QualitySettings } from "@/lib/quality";
import { liveIntent } from "@/lib/scene-state";

const SHAFT_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SHAFT_FRAGMENT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;

void main() {
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float beam = pow(smoothstep(0.0, 1.0, across), 2.2);
  // Bright at the top, dissolving downward.
  float fade = smoothstep(0.0, 0.2, vUv.y) * pow(vUv.y, 1.4);
  float shimmer = 0.8 + 0.2 * sin(vUv.y * 6.0 + uTime * 0.15 + uSeed * 6.0) * sin(vUv.x * 9.0 - uTime * 0.1);
  gl_FragColor = vec4(0.45, 0.78, 0.82, beam * fade * shimmer * uOpacity);
}
`;

const SHAFTS = [
  { x: -4.2, rotation: 0.38, width: 2.8, seed: 0.1 },
  { x: 0.8, rotation: 0.32, width: 2.2, seed: 0.5 },
  { x: 5.2, rotation: 0.4, width: 3.0, seed: 0.9 },
];

function LightShafts({ count, animate }: { count: number; animate: boolean }) {
  const materials = useMemo(
    () =>
      SHAFTS.slice(0, count).map(
        (shaft) =>
          new ShaderMaterial({
            vertexShader: SHAFT_VERTEX,
            fragmentShader: SHAFT_FRAGMENT,
            uniforms: { uTime: { value: 0 }, uSeed: { value: shaft.seed }, uOpacity: { value: 0.07 } },
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
            side: DoubleSide,
            fog: false,
          }),
      ),
    [count],
  );
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  useFrame((_, delta) => {
    for (const material of materials) {
      if (animate) material.uniforms.uTime!.value += Math.min(delta, 0.05);
      material.uniforms.uOpacity!.value = liveIntent.shaftOpacity;
    }
  });

  return (
    <>
      {materials.map((material, index) => {
        const shaft = SHAFTS[index]!;
        return (
          <mesh key={shaft.seed} material={material} position={[shaft.x, 2, -7]} rotation={[0, 0, shaft.rotation]} frustumCulled={false}>
            <planeGeometry args={[shaft.width, 18]} />
          </mesh>
        );
      })}
    </>
  );
}

/** Soft light panels the fish reflects: [colour, intensity, position, rotation (radians, x/y), size]. */
const REFLECTION_PANELS = [
  { color: "#bfe3ff", intensity: 2.2, position: [0, 5, -2], rotation: [Math.PI / 2, 0], size: [10, 2] },
  { color: "#5eead4", intensity: 1.4, position: [-5, 1, 0], rotation: [0, Math.PI / 2], size: [6, 1.5] },
  { color: "#9ec5ff", intensity: 0.9, position: [5, 0, -3], rotation: [0, -Math.PI / 2], size: [4, 3] },
] as const;

/**
 * Procedural reflection map: a few emissive panels rendered once into a PMREM cube. No network request, no HDR
 * file, and (unlike a loader-based environment helper) no loader code in the bundle. Disposed on unmount.
 */
function ReflectionMap() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const target = useMemo(() => {
    const panels = new Scene();
    const geometry = new PlaneGeometry(1, 1);
    const materials = REFLECTION_PANELS.map((panel) => new MeshBasicMaterial({ color: new Color(panel.color).multiplyScalar(panel.intensity), toneMapped: false, side: DoubleSide }));
    REFLECTION_PANELS.forEach((panel, i) => {
      const mesh = new Mesh(geometry, materials[i]);
      mesh.position.set(panel.position[0], panel.position[1], panel.position[2]);
      mesh.rotation.set(panel.rotation[0], panel.rotation[1], 0);
      mesh.scale.set(panel.size[0], panel.size[1], 1);
      panels.add(mesh);
    });
    const generator = new PMREMGenerator(gl);
    const result = generator.fromScene(panels, 0, 0.1, 100);
    generator.dispose();
    geometry.dispose();
    materials.forEach((material) => material.dispose());
    return result;
  }, [gl]);

  useEffect(() => {
    scene.environment = target.texture;
    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
    };
  }, [scene, target]);

  return null;
}

interface EnvironmentProps {
  settings: QualitySettings;
  animate: boolean;
}

/**
 * Abstract deep-water atmosphere: exponential fog in the page background colour (so distant things melt into
 * the page), faint light shafts, and procedural reflection panels that give the fish a metallic sheen.
 * No scenery by design.
 */
export function Environment({ settings, animate }: EnvironmentProps) {
  return (
    <>
      <fogExp2 attach="fog" args={["#07090c", 0.06]} />
      {settings.lightShafts > 0 && <LightShafts count={settings.lightShafts} animate={animate} />}
      {settings.reflections && <ReflectionMap />}
    </>
  );
}
