import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute } from "three";
import { PROJECT_IDS } from "@/lib/project-focus";
import { DIAGRAMS, PANEL_HEIGHT, PANEL_WIDTH, type DiagramDef, type DiagramEdge, type DiagramNode } from "./diagrams";

/** Fraction of the pulse loop spent travelling; the rest is rest, so the animation breathes. */
export const PULSE_TRAVEL = 0.8;

type Point = [x: number, y: number];

/** Line kinds understood by the line shader. */
export const LineKind = { Frame: 0, Edge: 1, FailureEdge: 2, NumberTick: 3 } as const;

const EPS = 1e-6;

function centerWithin(a: DiagramNode, b: DiagramNode) {
  return Math.abs(a.x - b.x) <= b.w / 2 + EPS;
}

/** Polyline between two nodes' borders. Always ends exactly on a node edge. */
export function routeEdge(a: DiagramNode, b: DiagramNode, route: DiagramEdge["route"] = "auto"): Point[] {
  const goingRight = b.x >= a.x;
  const goingUp = b.y >= a.y;

  if (route === "hv") {
    // Leave the side of `a`, run horizontally to b's column, then enter b from above or below.
    return [
      [a.x + (goingRight ? a.w / 2 : -a.w / 2), a.y],
      [b.x, a.y],
      [b.x, b.y + (goingUp ? -b.h / 2 : b.h / 2)],
    ];
  }
  if (route === "vh") {
    // Leave the top or bottom of `a`, run vertically to b's row, then enter b from its side.
    return [
      [a.x, a.y + (goingUp ? a.h / 2 : -a.h / 2)],
      [a.x, b.y],
      [b.x + (goingRight ? -b.w / 2 : b.w / 2), b.y],
    ];
  }
  if (Math.abs(a.y - b.y) < EPS) return [[a.x + (goingRight ? a.w / 2 : -a.w / 2), a.y], [b.x + (goingRight ? -b.w / 2 : b.w / 2), b.y]];
  if (centerWithin(a, b) || Math.abs(a.x - b.x) < EPS) {
    return [[a.x, a.y + (goingUp ? a.h / 2 : -a.h / 2)], [a.x, b.y + (goingUp ? -b.h / 2 : b.h / 2)]];
  }
  // Elbow: down/up from a, across, then into b.
  const midY = (a.y + (goingUp ? a.h / 2 : -a.h / 2) + b.y + (goingUp ? -b.h / 2 : b.h / 2)) / 2;
  return [[a.x, a.y + (goingUp ? a.h / 2 : -a.h / 2)], [a.x, midY], [b.x, midY], [b.x, b.y + (goingUp ? -b.h / 2 : b.h / 2)]];
}

export interface LaidOutEdge {
  from: string;
  to: string;
  tone: "normal" | "failure";
  points: Point[];
}

export interface LaidOutDiagram {
  id: DiagramDef["id"];
  nodes: DiagramNode[];
  edges: LaidOutEdge[];
  /** Per node id: time in 0..1 (of the loop) at which the pulse arrives. */
  arrival: Map<string, number>;
  /** Pulse segments per flow, with loop timing already assigned. */
  pulses: { from: Point; to: Point; start: number; end: number; offset: number }[];
}

const PULSE_OFFSETS = [0, 0.27, 0.54];

const segmentLength = ([x0, y0]: Point, [x1, y1]: Point) => Math.hypot((x1 - x0) * PANEL_WIDTH, (y1 - y0) * PANEL_HEIGHT);

/** Resolves a diagram into routed edges and timed pulse segments. `essentialOnly` drops supporting nodes and any flow that needs them. */
export function layoutDiagram(def: DiagramDef, essentialOnly: boolean): LaidOutDiagram {
  const nodes = essentialOnly ? def.nodes.filter((n) => n.essential) : def.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: LaidOutEdge[] = [];
  const edgeByPair = new Map<string, LaidOutEdge>();

  for (const edge of def.edges) {
    const a = byId.get(edge.from);
    const b = byId.get(edge.to);
    if (!a || !b) continue;
    const laidOut: LaidOutEdge = { from: edge.from, to: edge.to, tone: edge.tone ?? "normal", points: routeEdge(a, b, edge.route) };
    edges.push(laidOut);
    edgeByPair.set(`${edge.from}>${edge.to}`, laidOut);
  }

  const arrival = new Map<string, number>();
  const pulses: LaidOutDiagram["pulses"] = [];

  def.flows.forEach((flow, flowIndex) => {
    if (!flow.every((id) => byId.has(id))) return;
    const segments: { from: Point; to: Point; length: number }[] = [];
    const arrivalLength: number[] = [0];
    let total = 0;
    for (let i = 1; i < flow.length; i++) {
      const edge = edgeByPair.get(`${flow[i - 1]}>${flow[i]}`);
      if (!edge) throw new Error(`Flow in ${def.id} uses a missing edge ${flow[i - 1]} -> ${flow[i]}`);
      for (let k = 1; k < edge.points.length; k++) {
        const length = segmentLength(edge.points[k - 1]!, edge.points[k]!);
        segments.push({ from: edge.points[k - 1]!, to: edge.points[k]!, length });
        total += length;
      }
      arrivalLength.push(total);
    }
    flow.forEach((id, i) => {
      if (flowIndex === 0) arrival.set(id, (arrivalLength[i]! / total) * PULSE_TRAVEL);
    });

    let travelled = 0;
    for (const segment of segments) {
      const start = (travelled / total) * PULSE_TRAVEL;
      travelled += segment.length;
      const end = (travelled / total) * PULSE_TRAVEL;
      const offsets = flowIndex === 0 ? PULSE_OFFSETS.slice(0, 2) : [0.15];
      for (const offset of offsets) pulses.push({ from: segment.from, to: segment.to, start, end, offset });
    }
  });

  return { id: def.id, nodes, edges, arrival, pulses };
}

export interface WorldGeometryOptions {
  essentialOnly: boolean;
  pulses: boolean;
}

export interface WorldGeometry {
  bodies: BufferGeometry;
  lines: BufferGeometry;
  nodes: BufferGeometry;
  pulses: BufferGeometry | null;
  counts: { nodes: number; lineSegments: number; pulses: number };
}

function buildBodies(): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const panels: number[] = [];
  const indices: number[] = [];
  PROJECT_IDS.forEach((_, panel) => {
    const base = panel * 4;
    for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]] as const) {
      positions.push(x, y, 0);
      uvs.push(x + 0.5, y + 0.5);
      panels.push(panel);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aPanel", new Float32BufferAttribute(panels, 1));
  geometry.setIndex(new Uint16BufferAttribute(indices, 1));
  return geometry;
}

/** Panel furniture drawn as lines: corner brackets, a header rule and one tick per project number. */
function panelDecorations(panel: number, push: (a: Point, b: Point, kind: number) => void) {
  const bx = 0.045;
  const by = 0.07;
  const inset = 0.035;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = sx * (0.5 - inset);
      const cy = sy * (0.5 - inset);
      push([cx, cy], [cx - sx * bx, cy], LineKind.Frame);
      push([cx, cy], [cx, cy - sy * by], LineKind.Frame);
    }
  }
  push([-0.45, 0.36], [0.45, 0.36], LineKind.Frame);
  // Project number as ticks (1-4), so no font is needed.
  for (let k = 0; k <= panel; k++) push([-0.44 + k * 0.022, 0.4], [-0.44 + k * 0.022, 0.45], LineKind.NumberTick);
}

/** All four panels' bodies, diagram lines, node quads and pulse points as four shared geometries. */
export function buildWorldGeometry({ essentialOnly, pulses: withPulses }: WorldGeometryOptions): WorldGeometry {
  const laidOut = DIAGRAMS.map((def) => layoutDiagram(def, essentialOnly));

  const linePositions: number[] = [];
  const linePanels: number[] = [];
  const lineKinds: number[] = [];
  const pushLine = (panel: number) => (a: Point, b: Point, kind: number) => {
    linePositions.push(a[0], a[1], 0, b[0], b[1], 0);
    linePanels.push(panel, panel);
    lineKinds.push(kind, kind);
  };

  const nodePositions: number[] = [];
  const nodeUvs: number[] = [];
  const nodePanels: number[] = [];
  const nodeRects: number[] = [];
  const nodeKinds: number[] = [];
  const nodeFlows: number[] = [];
  const nodeIndices: number[] = [];

  const pulsePanels: number[] = [];
  const pulseSegments: number[] = [];
  const pulseTimings: number[] = [];

  laidOut.forEach((diagram, panel) => {
    const addLine = pushLine(panel);
    panelDecorations(panel, addLine);

    for (const edge of diagram.edges) {
      const kind = edge.tone === "failure" ? LineKind.FailureEdge : LineKind.Edge;
      for (let i = 1; i < edge.points.length; i++) addLine(edge.points[i - 1]!, edge.points[i]!, kind);
    }

    for (const n of diagram.nodes) {
      const base = nodePositions.length / 3;
      for (const [x, y] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]] as const) {
        nodePositions.push(x, y, 0);
        nodeUvs.push(x + 0.5, y + 0.5);
        nodePanels.push(panel);
        nodeRects.push(n.x, n.y, n.w, n.h);
        nodeKinds.push(n.tone === "failure" ? 1 : 0);
        nodeFlows.push(diagram.arrival.get(n.id) ?? -1);
      }
      nodeIndices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    for (const p of diagram.pulses) {
      pulsePanels.push(panel);
      pulseSegments.push(p.from[0], p.from[1], p.to[0], p.to[1]);
      pulseTimings.push(p.start, p.end, p.offset);
    }
  });

  const lines = new BufferGeometry();
  lines.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
  lines.setAttribute("aPanel", new Float32BufferAttribute(linePanels, 1));
  lines.setAttribute("aKind", new Float32BufferAttribute(lineKinds, 1));

  const nodes = new BufferGeometry();
  nodes.setAttribute("position", new Float32BufferAttribute(nodePositions, 3));
  nodes.setAttribute("uv", new Float32BufferAttribute(nodeUvs, 2));
  nodes.setAttribute("aPanel", new Float32BufferAttribute(nodePanels, 1));
  nodes.setAttribute("aRect", new Float32BufferAttribute(nodeRects, 4));
  nodes.setAttribute("aKind", new Float32BufferAttribute(nodeKinds, 1));
  nodes.setAttribute("aFlow", new Float32BufferAttribute(nodeFlows, 1));
  nodes.setIndex(new Uint16BufferAttribute(nodeIndices, 1));

  let pulseGeometry: BufferGeometry | null = null;
  if (withPulses && pulsePanels.length > 0) {
    pulseGeometry = new BufferGeometry();
    pulseGeometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(pulsePanels.length * 3), 3));
    pulseGeometry.setAttribute("aPanel", new Float32BufferAttribute(pulsePanels, 1));
    pulseGeometry.setAttribute("aSeg", new Float32BufferAttribute(pulseSegments, 4));
    pulseGeometry.setAttribute("aTiming", new Float32BufferAttribute(pulseTimings, 3));
  }

  return {
    bodies: buildBodies(),
    lines,
    nodes,
    pulses: pulseGeometry,
    counts: { nodes: nodePanels.length / 4, lineSegments: linePanels.length / 2, pulses: pulsePanels.length },
  };
}
