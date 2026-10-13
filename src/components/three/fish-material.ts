import { DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, type IUniform } from "three";
import { FISH_HEAD_X, FISH_LENGTH } from "./fish-geometry";

export interface FishUniforms {
  uTime: IUniform<number>;
  /** Body wave amplitude multiplier (slow, small variation so the stroke is never mechanical). */
  uAmp: IUniform<number>;
  /** Final brightness 0..1, applied before fog so a dimmed fish melts into the page. */
  uIntensity: IUniform<number>;
}

/** Edge light that keeps the silhouette reading as a fish when the body itself is dimmed. Restrained on purpose. */
const RIM_STRENGTH = 0.55;
const RIM_COLOR = "vec3(0.15, 0.52, 0.50)";
/** Fraction of the scene's fog the fish receives: a little less than the environment, so it stays legible at depth. */
const FISH_FOG_SHARE = 0.72;

export interface FishMaterialOptions {
  physical: boolean;
  reflections: boolean;
}

/** Swim wave constants, mirrored by the GLSL below. Exported so tests can assert the intended shape. */
export const SWIM = {
  /** Radians of phase per body length: wavelength of roughly one body length. */
  waveNumber: 5.2,
  /** Radians per second; about 0.55 Hz tail beat, deliberately unhurried. */
  angularSpeed: 3.6,
  headAmplitude: 0.012,
  tailAmplitude: 0.075,
} as const;

const VERTEX_COMMON = /* glsl */ `
attribute float aFlap;
uniform float uTime;
uniform float uAmp;

// t: 0 at the nose, 1 at the tail root, slightly above 1 across the tail fin.
float swimT(float x) { return clamp((${FISH_HEAD_X.toFixed(3)} - x) / ${FISH_LENGTH.toFixed(3)}, 0.0, 1.25); }
float swimAmp(float t) { return (${SWIM.headAmplitude} + ${SWIM.tailAmplitude} * t * t) * uAmp; }
float swimPhase(float t) { return ${SWIM.waveNumber} * t - uTime * ${SWIM.angularSpeed}; }
// Sideways offset of the spine. The phase decreases with time at fixed t, so the wave travels head to tail.
float swimOffset(float t) { return swimAmp(t) * sin(swimPhase(t)); }
// d(offset)/dx, used to tilt normals so lighting follows the bend.
float swimSlope(float t) {
  float dAmp = 2.0 * ${SWIM.tailAmplitude} * t * uAmp;
  float d = dAmp * sin(swimPhase(t)) + swimAmp(t) * ${SWIM.waveNumber} * cos(swimPhase(t));
  return -d / ${FISH_LENGTH.toFixed(3)};
}
`;

const NORMAL_PATCH = /* glsl */ `
{
  float t = swimT(position.x);
  objectNormal.x -= objectNormal.z * swimSlope(t);
}
`;

const POSITION_PATCH = /* glsl */ `
{
  float t = swimT(position.x);
  transformed.z += swimOffset(t);
  // Pectoral fins scull gently: only vertices with aFlap > 0 (the free edge) move.
  transformed.z += aFlap * sign(position.z) * 0.035 * sin(uTime * 2.3);
  transformed.y += aFlap * 0.012 * sin(uTime * 2.3 + 1.2);
}
`;

/**
 * Lit PBR material whose vertex stage bends the fish with a travelling wave. Using the standard
 * material keeps real lighting and reflections; only the vertex transform is customized.
 */
export function createFishMaterial({ physical, reflections }: FishMaterialOptions) {
  const uniforms: FishUniforms = { uTime: { value: 0 }, uAmp: { value: 1 }, uIntensity: { value: 1 } };

  const material = physical
    ? new MeshPhysicalMaterial({ vertexColors: true, metalness: 0.32, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 1.1, side: DoubleSide })
    : new MeshStandardMaterial({ vertexColors: true, metalness: reflections ? 0.5 : 0.15, roughness: 0.55, side: DoubleSide });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uAmp = uniforms.uAmp;
    shader.uniforms.uIntensity = uniforms.uIntensity;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_COMMON}`)
      .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>\n${NORMAL_PATCH}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n${POSITION_PATCH}`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uIntensity;")
      .replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
  // Fresnel rim: strongest at grazing angles, so it traces the outline rather than lighting the flank.
  float rim = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.5);
  gl_FragColor.rgb = gl_FragColor.rgb * uIntensity + ${RIM_COLOR} * rim * ${RIM_STRENGTH.toFixed(2)} * (0.45 + 0.55 * uIntensity);`,
      )
      .replace(
        "#include <fog_fragment>",
        `#ifdef USE_FOG
  // Same exponential fog as the scene (fogExp2), shared at FISH_FOG_SHARE.
  float fishFog = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fishFog * ${FISH_FOG_SHARE.toFixed(2)});
#endif`,
      );
  };
  material.customProgramCacheKey = () => `fish-swim-${physical ? "physical" : "standard"}`;

  return { material, uniforms };
}
