import { AdditiveBlending, DoubleSide, Matrix4, NormalBlending, ShaderMaterial, Vector4, type IUniform } from "three";
import { PANEL_HEIGHT, PANEL_WIDTH } from "./diagrams";

export const PANEL_COUNT = 4;

/** One uniform block shared by every material in the project world: four panel transforms and their states. */
export interface WorldUniforms {
  [uniform: string]: IUniform;
  uPanelMatrix: IUniform<Matrix4[]>;
  /** x: opacity, y: active 0..1, z: diagram detail 0..1. */
  uPanelState: IUniform<Vector4[]>;
  uGallery: IUniform<number>;
  /** 1 draws the glass body (fill + sheen); 0 draws borders only (low tier). */
  uFill: IUniform<number>;
  /** 0..1 position in the flow loop. */
  uPhase: IUniform<number>;
  /** 1 = static composition: no travelling glow. */
  uStatic: IUniform<number>;
  uPixelRatio: IUniform<number>;
  /** 0..1: dissolve the left of each panel (tablets, where the copy runs full width beside the panel). */
  uFadeLeft: IUniform<number>;
}

export function createWorldUniforms(): WorldUniforms {
  return {
    uPanelMatrix: { value: Array.from({ length: PANEL_COUNT }, () => new Matrix4()) },
    uPanelState: { value: Array.from({ length: PANEL_COUNT }, () => new Vector4()) },
    uGallery: { value: 0 },
    uFill: { value: 1 },
    uPhase: { value: 0 },
    uStatic: { value: 0 },
    uPixelRatio: { value: 1 },
    uFadeLeft: { value: 0 },
  };
}

const VERTEX_COMMON = /* glsl */ `
uniform mat4 uPanelMatrix[${PANEL_COUNT}];
uniform vec4 uPanelState[${PANEL_COUNT}];
uniform float uGallery;
uniform float uPhase;
uniform float uStatic;
uniform float uFadeLeft;
attribute float aPanel;

// 1 on the right of the panel, easing to 0 toward its left edge when uFadeLeft is on (panel-local x, -0.5..0.5).
float leftFade(float x) { return mix(1.0, smoothstep(-0.5, 0.15, x), uFadeLeft); }

int panelIndex() { return int(aPanel + 0.5); }
vec4 panelWorld(vec2 local) { return uPanelMatrix[panelIndex()] * vec4(local, 0.0, 1.0); }
vec4 panelState() { return uPanelState[panelIndex()]; }
vec4 toClip(vec4 world) { return projectionMatrix * viewMatrix * world; }
`;

// Glass body: graphite with a soft diagonal sheen. In loose mode it is exactly Phase 4's hairline plane.
const BODY_VERTEX = /* glsl */ `
${VERTEX_COMMON}
varying vec2 vUv;
varying vec4 vState;
void main() {
  vUv = uv;
  vState = panelState();
  gl_Position = toClip(panelWorld(position.xy));
}
`;

const BODY_FRAGMENT = /* glsl */ `
uniform float uGallery;
uniform float uFill;
uniform float uFadeLeft;
varying vec2 vUv;
varying vec4 vState;

void main() {
  vec2 edge = min(vUv, 1.0 - vUv);
  float borderWidth = mix(0.012, 0.005, uGallery);
  float border = 1.0 - smoothstep(0.0, borderWidth, min(edge.x * 1.55, edge.y));

  float looseFill = 0.10 * smoothstep(0.0, 1.0, vUv.y);
  float band = 1.0 - smoothstep(0.0, 0.35, abs(vUv.x * 0.8 + vUv.y * 0.6 - (0.55 + 0.25 * vState.y)));
  float galleryFill = (0.40 + 0.16 * vUv.y) * uFill;
  float fill = mix(looseFill, galleryFill, uGallery);

  vec3 fillColor = mix(vec3(0.55, 0.85, 0.88), vec3(0.045, 0.062, 0.08), uGallery);
  fillColor += vec3(0.10, 0.22, 0.24) * band * 0.18 * uGallery * uFill;
  vec3 borderColor = mix(vec3(0.55, 0.85, 0.88), vec3(0.62, 0.76, 0.80), uGallery);

  float alpha = vState.x * (fill + border * mix(0.9, 0.55, uGallery)) * mix(1.0, smoothstep(0.0, 0.65, vUv.x), uFadeLeft);
  gl_FragColor = vec4(mix(fillColor, borderColor, clamp(border * 1.2, 0.0, 1.0)), alpha);
}
`;

// Lines: panel furniture, routed edges and failure paths. Alpha comes from the panel's active/detail state.
const LINE_VERTEX = /* glsl */ `
${VERTEX_COMMON}
attribute float aKind;
varying float vAlpha;
varying vec3 vColor;
void main() {
  vec4 s = panelState();
  vec3 teal = vec3(0.45, 0.85, 0.82);
  vec3 muted = vec3(0.60, 0.60, 0.66);
  float a;
  vec3 c = teal;
  if (aKind < 0.5) a = 0.30 * s.x;                        // brackets and header rule
  else if (aKind < 1.5) a = mix(0.06, 0.30, s.y) * s.z;   // edge
  else if (aKind < 2.5) { a = mix(0.04, 0.20, s.y) * s.z; c = muted; } // failure path: muted, not alarming
  else a = mix(0.35, 0.90, s.y) * s.x;                    // number ticks
  vAlpha = a * uGallery * leftFade(position.x);
  vColor = c;
  gl_Position = toClip(panelWorld(position.xy));
}
`;

const LINE_FRAGMENT = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() { gl_FragColor = vec4(vColor, vAlpha); }
`;

// Nodes: quiet rectangles with a hairline border. A node brightens briefly when the pulse reaches it.
const NODE_VERTEX = /* glsl */ `
${VERTEX_COMMON}
attribute vec4 aRect;
attribute float aKind;
attribute float aFlow;
varying vec2 vUv;
varying vec4 vState;
varying float vKind;
varying float vGlow;
varying vec2 vSize;
varying float vFade;
void main() {
  vUv = uv;
  vState = panelState();
  vKind = aKind;
  vFade = leftFade(aRect.x);
  vSize = aRect.zw * vec2(${PANEL_WIDTH.toFixed(2)}, ${PANEL_HEIGHT.toFixed(2)});
  float since = fract(uPhase - aFlow + 1.0);
  vGlow = (aFlow >= 0.0 && uStatic < 0.5) ? exp(-8.0 * since) : 0.0;
  gl_Position = toClip(panelWorld(aRect.xy + position.xy * aRect.zw));
}
`;

const NODE_FRAGMENT = /* glsl */ `
uniform float uGallery;
varying vec2 vUv;
varying vec4 vState;
varying float vKind;
varying float vGlow;
varying vec2 vSize;
varying float vFade;
void main() {
  vec2 e = min(vUv, 1.0 - vUv) * vSize;
  float border = 1.0 - smoothstep(0.0, 0.016, min(e.x, e.y));
  float base = mix(0.06, 0.30, vState.y) * vState.z;
  float glow = vGlow * vState.y * vState.z;
  vec3 color = vKind < 0.5 ? vec3(0.45, 0.85, 0.82) : vec3(0.62, 0.62, 0.68);
  float weight = vKind < 0.5 ? 1.0 : 0.6;
  float fill = (0.04 + glow * 0.18) * vState.z * (0.4 + 0.6 * vState.y);
  gl_FragColor = vec4(color, (border * (base + glow * 0.35) + fill) * weight * uGallery * vFade);
}
`;

// Pulses: one point per route segment; position and visibility are computed from the shared loop phase on the GPU.
const PULSE_VERTEX = /* glsl */ `
${VERTEX_COMMON}
attribute vec4 aSeg;
attribute vec3 aTiming;
uniform float uPixelRatio;
varying float vAlpha;
void main() {
  vec4 s = panelState();
  float phase = fract(uPhase + aTiming.z);
  float t = (phase - aTiming.x) / max(aTiming.y - aTiming.x, 0.0001);
  float on = step(0.0, t) * step(t, 1.0);
  vec2 local = mix(aSeg.xy, aSeg.zw, clamp(t, 0.0, 1.0));
  vec4 mv = viewMatrix * panelWorld(local);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = 7.0 * uPixelRatio * (12.0 / -mv.z);
  // Only the active project's pulse is visible; inactive diagrams stay still.
  vAlpha = on * s.y * s.y * s.z * 0.85 * uGallery * leftFade(local.x);
}
`;

const PULSE_FRAGMENT = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  gl_FragColor = vec4(0.55, 0.95, 0.9, smoothstep(0.5, 0.0, d) * vAlpha);
}
`;

const base = { transparent: true, depthWrite: false, fog: false } as const;

export function createWorldMaterials(uniforms: WorldUniforms) {
  return {
    body: new ShaderMaterial({ ...base, uniforms, vertexShader: BODY_VERTEX, fragmentShader: BODY_FRAGMENT, blending: NormalBlending, side: DoubleSide }),
    lines: new ShaderMaterial({ ...base, uniforms, vertexShader: LINE_VERTEX, fragmentShader: LINE_FRAGMENT, blending: AdditiveBlending }),
    nodes: new ShaderMaterial({ ...base, uniforms, vertexShader: NODE_VERTEX, fragmentShader: NODE_FRAGMENT, blending: AdditiveBlending, side: DoubleSide }),
    pulses: new ShaderMaterial({ ...base, uniforms, vertexShader: PULSE_VERTEX, fragmentShader: PULSE_FRAGMENT, blending: AdditiveBlending }),
  };
}
