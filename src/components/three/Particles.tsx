import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { liveIntent } from "@/lib/scene-state";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, ShaderMaterial } from "three";

const VERTEX = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uDensity;
varying float vAlpha;

void main() {
  vec3 p = position;
  // Slow upward drift, wrapped inside a 12-unit column; a little lateral sway per particle.
  p.y = mod(p.y + 6.0 + uTime * (0.015 + aSeed * 0.035), 12.0) - 6.0;
  p.x += sin(uTime * 0.07 + aSeed * 20.0) * 0.5;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.2 + aSeed * 2.2) * uPixelRatio * (9.0 / depth);
  // Fade with distance and when very close to the camera, so nothing pops or smears across text.
  vAlpha = (0.2 + 0.45 * aSeed) * (1.0 - smoothstep(9.0, 22.0, depth)) * smoothstep(1.5, 4.0, depth);
  // Sparser sections hide the highest-seed particles; the edge is soft so density changes fade, not pop.
  vAlpha *= uOpacity * (1.0 - smoothstep(uDensity - 0.08, uDensity, aSeed));
}
`;

const FRAGMENT = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(0.62, 0.84, 0.88, a * vAlpha);
}
`;

/** Small deterministic PRNG (mulberry32) so the particle field is identical across renders and tests. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ParticlesProps {
  count: number;
  animate: boolean;
}

/** Sparse suspended particles. All motion is in the vertex shader: no per-frame CPU work beyond one uniform. */
export function Particles({ count, animate }: ParticlesProps) {
  const dpr = useThree((state) => state.viewport.dpr);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const random = seededRandom(7);
    for (let i = 0; i < count; i++) {
      positions.set([(random() - 0.5) * 18, (random() - 0.5) * 12, -12 + random() * 15], i * 3);
      seeds[i] = random();
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(positions, 3));
    result.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    return result;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: { uTime: { value: 3 }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 }, uDensity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    material.uniforms.uPixelRatio!.value = dpr;
  }, [material, dpr]);

  useFrame((_, delta) => {
    if (animate) material.uniforms.uTime!.value += Math.min(delta, 0.05);
    material.uniforms.uOpacity!.value = liveIntent.particleOpacity;
    material.uniforms.uDensity!.value = liveIntent.particleDensity;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
