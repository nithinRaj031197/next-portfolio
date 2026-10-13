import { BufferGeometry, Color, Float32BufferAttribute, MathUtils, Shape, ShapeGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Fish space: unit body length, nose at +X, tail at -X, +Y up, +Z to the fish's right.
 * The vertex shader (fish-material.ts) assumes this convention and the constants below.
 */
export const FISH_LENGTH = 1;
export const FISH_HEAD_X = 0.5;

const BACK = new Color("#26394a");
const BELLY = new Color("#c4d1da");
const FIN = new Color("#3d5967");

const PECTORAL_ATTACH = { x: 0.2, y: -0.05, z: 0.055 };

/**
 * Cross-section envelope along the body, u: 0 at the nose to 1 at the tail root. A blunt, rounded head and a full
 * front third (widest near u = 0.38) taper smoothly to a slim tail root: carp-like rather than predatory.
 */
export const bodyEnvelope = (u: number) => Math.pow(Math.sin(Math.PI * Math.pow(u, 0.7)), 0.78);

function paint(geometry: BufferGeometry, color: Color, flap = 0) {
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  const flaps = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    colors.set([color.r, color.g, color.b], i * 3);
    flaps[i] = flap;
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aFlap", new Float32BufferAttribute(flaps, 1));
}

function createBody(segments: number, rings: number): BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const color = new Color();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const x = FISH_HEAD_X - u * FISH_LENGTH;
    const envelope = bodyEnvelope(u);
    const halfHeight = 0.135 * envelope;
    const halfWidth = 0.072 * envelope;
    // A soft shoulder behind the head gives the back a gentle, continuous curve.
    const arch = 0.02 * Math.sin(Math.PI * Math.pow(u, 0.7));

    for (let j = 0; j < rings; j++) {
      const angle = (j / rings) * Math.PI * 2;
      const up = Math.cos(angle);
      // Flatter belly than back keeps the silhouette from reading as a tube.
      positions.push(x, arch + halfHeight * up * (up < 0 ? 0.82 : 1), halfWidth * Math.sin(angle));
      color.copy(BACK).lerp(BELLY, MathUtils.smoothstep(-up, -0.15, 0.8));
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < rings; j++) {
      const a = i * rings + j;
      const b = i * rings + ((j + 1) % rings);
      const c = (i + 1) * rings + j;
      const d = (i + 1) * rings + ((j + 1) % rings);
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals(); // indexed with wrapped seam, so the ring has no visible seam
  const flat = geometry.toNonIndexed();
  geometry.dispose();
  flat.setAttribute("aFlap", new Float32BufferAttribute(new Float32Array(flat.getAttribute("position").count), 1));
  return flat;
}

function finGeometry(shape: Shape): BufferGeometry {
  const geometry = new ShapeGeometry(shape, 10);
  geometry.deleteAttribute("uv");
  return geometry.index ? geometry.toNonIndexed() : geometry;
}

function createCaudalFin(): BufferGeometry {
  const shape = new Shape();
  // Softly forked: short rounded lobes and a shallow notch.
  shape.moveTo(-0.43, 0.026);
  shape.bezierCurveTo(-0.5, 0.05, -0.57, 0.11, -0.665, 0.165);
  shape.bezierCurveTo(-0.67, 0.09, -0.62, 0.025, -0.585, 0);
  shape.bezierCurveTo(-0.62, -0.025, -0.67, -0.09, -0.665, -0.165);
  shape.bezierCurveTo(-0.57, -0.11, -0.5, -0.05, -0.43, -0.026);
  shape.closePath();
  const geometry = finGeometry(shape);
  paint(geometry, FIN);
  return geometry;
}

function createDorsalFin(): BufferGeometry {
  const shape = new Shape();
  // Long, low and smooth, rising out of the shoulder rather than standing up from the back.
  shape.moveTo(0.2, 0.135);
  shape.bezierCurveTo(0.13, 0.2, 0.03, 0.25, -0.07, 0.23);
  shape.bezierCurveTo(-0.12, 0.2, -0.16, 0.15, -0.21, 0.1);
  shape.closePath();
  const geometry = finGeometry(shape);
  paint(geometry, FIN);
  return geometry;
}

function createPectoralFin(side: 1 | -1): BufferGeometry {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.02, -0.03, -0.07, -0.08, -0.14, -0.105);
  shape.bezierCurveTo(-0.11, -0.05, -0.075, -0.02, -0.045, 0.01);
  shape.closePath();
  const geometry = finGeometry(shape);

  // aFlap grows with distance from the attachment point so only the free edge sculls.
  const position = geometry.getAttribute("position");
  const flaps = new Float32Array(position.count);
  for (let i = 0; i < position.count; i++) flaps[i] = Math.min(Math.hypot(position.getX(i), position.getY(i)) / 0.17, 1);
  paint(geometry, FIN);
  geometry.setAttribute("aFlap", new Float32BufferAttribute(flaps, 1));

  geometry.rotateX(-side * 1.0);
  geometry.translate(PECTORAL_ATTACH.x, PECTORAL_ATTACH.y, PECTORAL_ATTACH.z * side);
  return geometry;
}

/** Body plus fins as one merged, non-indexed geometry: one mesh, one draw call. */
export function createFishGeometry(segments: number, rings: number): BufferGeometry {
  const parts = [createBody(segments, rings), createCaudalFin(), createDorsalFin(), createPectoralFin(1), createPectoralFin(-1)];
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("Fish geometry parts have mismatched attributes");
  return merged;
}
