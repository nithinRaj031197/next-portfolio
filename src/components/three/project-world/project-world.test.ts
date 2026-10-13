import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { PROJECT_IDS } from "@/lib/project-focus";
import { DIAGRAMS, PANEL_WIDTH } from "./diagrams";
import { PULSE_TRAVEL, buildWorldGeometry, layoutDiagram, routeEdge } from "./diagram-geometry";
import { TAN_HALF_FOV } from "../scene-constants";
import { KEYFRAMES } from "@/lib/choreography";
import { COMPACT_GALLERY, DESKTOP_GALLERY, computePanelPose, createPanelPose, type LayoutInput } from "./layout";

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-6 && Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 1e-6;

describe("diagram definitions", () => {
  it("cover every project once, in the same order as the semantic content", () => {
    expect(DIAGRAMS.map((d) => d.id)).toEqual([...PROJECT_IDS]);
    expect(DIAGRAMS.map((d) => d.id)).toEqual(projects.map((p) => p.id));
  });

  it.each(DIAGRAMS)("$id: nodes are inside the panel, below the header rule, and never overlap", (diagram) => {
    for (const n of diagram.nodes) {
      expect(n.x - n.w / 2, n.id).toBeGreaterThanOrEqual(-0.5 + 0.03 - 1e-9);
      expect(n.x + n.w / 2, n.id).toBeLessThanOrEqual(0.5 - 0.03 + 1e-9);
      expect(n.y + n.h / 2, n.id).toBeLessThanOrEqual(0.34);
      expect(n.y - n.h / 2, n.id).toBeGreaterThanOrEqual(-0.46);
    }
    for (let i = 0; i < diagram.nodes.length; i++) {
      for (let j = i + 1; j < diagram.nodes.length; j++) expect(overlaps(diagram.nodes[i]!, diagram.nodes[j]!), `${diagram.nodes[i]!.id} / ${diagram.nodes[j]!.id}`).toBe(false);
    }
  });

  it.each(DIAGRAMS)("$id: every edge joins existing nodes and every flow follows existing edges", (diagram) => {
    const ids = new Set(diagram.nodes.map((n) => n.id));
    expect(ids.size).toBe(diagram.nodes.length);
    for (const edge of diagram.edges) {
      expect(ids.has(edge.from), edge.from).toBe(true);
      expect(ids.has(edge.to), edge.to).toBe(true);
    }
    expect(() => layoutDiagram(diagram, false)).not.toThrow();
    expect(diagram.flows.length).toBeGreaterThan(0);
  });

  it("routes edges so they start and end exactly on node borders", () => {
    for (const diagram of DIAGRAMS) {
      const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
      for (const edge of layoutDiagram(diagram, false).edges) {
        const a = byId.get(edge.from)!;
        const b = byId.get(edge.to)!;
        const onBorder = (p: [number, number], n: typeof a) => {
          const dx = Math.abs(p[0] - n.x) - n.w / 2;
          const dy = Math.abs(p[1] - n.y) - n.h / 2;
          return Math.abs(Math.max(dx, dy)) < 1e-6;
        };
        expect(onBorder(edge.points[0]!, a), `${edge.from}->${edge.to} start`).toBe(true);
        expect(onBorder(edge.points.at(-1)!, b), `${edge.from}->${edge.to} end`).toBe(true);
      }
    }
  });

  it("uses elbows only where needed", () => {
    const a = { id: "a", x: -0.2, y: 0, w: 0.1, h: 0.1 };
    const b = { id: "b", x: 0.2, y: 0, w: 0.1, h: 0.1 };
    expect(routeEdge(a, b)).toHaveLength(2);
    expect(routeEdge(a, { ...b, y: 0.3 })).toHaveLength(4);
    expect(routeEdge(a, { ...b, x: -0.2, y: 0.3 })).toHaveLength(2);
  });

  it("times pulses to arrive at nodes in order, inside the travel window", () => {
    for (const diagram of DIAGRAMS) {
      const laid = layoutDiagram(diagram, false);
      const flow = diagram.flows[0]!;
      let previous = -1;
      for (const id of flow) {
        const t = laid.arrival.get(id)!;
        expect(t).toBeGreaterThanOrEqual(previous);
        expect(t).toBeLessThanOrEqual(PULSE_TRAVEL + 1e-9);
        previous = t;
      }
      expect(laid.pulses.every((p) => p.start >= 0 && p.end <= PULSE_TRAVEL + 1e-9 && p.end > p.start)).toBe(true);
    }
  });

  it("is grounded in the federation repo's own terminology for failure paths", () => {
    const federation = DIAGRAMS.find((d) => d.id === "federation")!;
    const failures = federation.nodes.filter((n) => n.tone === "failure").map((n) => n.id);
    expect(failures).toEqual(expect.arrayContaining(["invalid-entry", "origin-rejected", "remote-unavailable", "contract-mismatch", "error-boundary"]));
  });
});

describe("merged geometry", () => {
  it("is four geometries for the whole world regardless of project count, and small", () => {
    const world = buildWorldGeometry({ essentialOnly: false, pulses: true });
    expect(world.counts.nodes).toBeLessThan(80);
    expect(world.counts.lineSegments).toBeLessThan(250);
    expect(world.counts.pulses).toBeLessThan(120);
    expect(world.pulses).not.toBeNull();
    for (const g of [world.bodies, world.lines, world.nodes]) expect(g.getAttribute("aPanel")).toBeDefined();
  });

  it("drops supporting nodes and pulses for the low tier / mobile", () => {
    const full = buildWorldGeometry({ essentialOnly: false, pulses: true });
    const low = buildWorldGeometry({ essentialOnly: true, pulses: false });
    expect(low.counts.nodes).toBeLessThan(full.counts.nodes * 0.7);
    expect(low.counts.lineSegments).toBeLessThan(full.counts.lineSegments);
    expect(low.pulses).toBeNull();
  });
});

describe("panel layout", () => {
  const base: LayoutInput = { position: 1, weights: [0.1, 0.8, 0.1, 0], gallery: 1, alignment: 0.3, structure: 0.55, textDensity: 0.9, detail: 1, aspect: 1.6, compact: false, looseVisibility: 1 };
  const pose = (input: LayoutInput, i: number) => {
    const out = createPanelPose();
    computePanelPose(i, input, out);
    return out;
  };

  it("forms a left-to-right row: active strongest, next still visible, previous retired but not gone", () => {
    const row = [0, 1, 2, 3].map((i) => pose(base, i));
    expect(row[0]!.x).toBeLessThan(row[1]!.x);
    expect(row[1]!.x).toBeLessThan(row[2]!.x);
    expect(row[2]!.x).toBeLessThan(row[3]!.x);
    const nearest = Math.max(...row.map((p) => p.z));
    expect(row[1]!.z).toBe(nearest);
    // base: reading project 1, so panel 0 is behind the reader and panel 2 is ahead.
    expect(row[1]!.opacity).toBeGreaterThan(row[2]!.opacity);
    expect(row[2]!.opacity).toBeGreaterThan(row[0]!.opacity * 2);
    expect(row[2]!.opacity).toBeGreaterThan(0.3);
    expect(row[0]!.opacity).toBeGreaterThan(0.1); // peripheral awareness, not removal
    expect(row[0]!.detail).toBeLessThan(row[2]!.detail * 0.3);
    expect(row[1]!.detail).toBeGreaterThan(row[2]!.detail);
  });

  it("keeps the gallery shallow: depth differences are small", () => {
    const row = [0, 1, 2, 3].map((i) => pose(base, i));
    const zs = row.map((p) => p.z);
    expect(Math.max(...zs) - Math.min(...zs)).toBeLessThan(4);
  });

  it("reduces to the loose planes at gallery = 0 and never jumps while forming", () => {
    const loose = pose({ ...base, gallery: 0 }, 0);
    expect(loose.x).toBe(-3.6);
    expect(loose.width).toBe(4);
    let previous = pose({ ...base, gallery: 0 }, 1);
    for (let g = 0.01; g <= 1.0001; g += 0.01) {
      const next = pose({ ...base, gallery: g }, 1);
      expect(Math.abs(next.x - previous.x)).toBeLessThan(0.35);
      expect(Math.abs(next.z - previous.z)).toBeLessThan(0.35);
      expect(Math.abs(next.opacity - previous.opacity)).toBeLessThan(0.05);
      previous = next;
    }
  });

  it("slides smoothly as the project position changes", () => {
    let previous = pose({ ...base, position: 0 }, 2);
    for (let p = 0.02; p <= 3; p += 0.02) {
      const next = pose({ ...base, position: p }, 2);
      expect(Math.abs(next.x - previous.x)).toBeLessThan(0.7);
      previous = next;
    }
  });

  it("retires the previous panel out of the text column and keeps it out of the way", () => {
    for (const aspect of [1.6, 1.78, 2.1]) {
      const retired = pose({ ...base, position: 2, aspect }, 1); // reading project 2: panel 1 is behind
      const depth = 7 - retired.z;
      const halfWidth = TAN_HALF_FOV * depth * aspect;
      const rightEdge = (retired.x + retired.width / 2) / halfWidth;
      expect(rightEdge, `aspect ${aspect}`).toBeLessThan(-0.7);
      expect(retired.detail).toBeLessThan(0.1);
    }
  });

  it("makes the active panel larger than before and offset to the right, so it frames the HTML card", () => {
    expect(DESKTOP_GALLERY.scale).toBeGreaterThan(1);
    expect(DESKTOP_GALLERY.activeX).toBeGreaterThan(0.5);
  });

  it("shows one centred, smaller panel at a time on compact screens", () => {
    const compact = pose({ ...base, compact: true, aspect: 0.46, position: 1.0 }, 1);
    const desktop = pose(base, 1);
    expect(Math.abs(compact.x)).toBeLessThan(0.01);
    expect(compact.width).toBeCloseTo(PANEL_WIDTH * COMPACT_GALLERY.scale, 6);
    expect(compact.width).toBeLessThan(desktop.width);
    expect(pose({ ...base, compact: true, aspect: 0.46, position: 1 }, 3).x).toBeGreaterThan(compact.width);
  });

  it("hides the loose planes on the low tier until the gallery forms", () => {
    expect(pose({ ...base, gallery: 0, looseVisibility: 0 }, 0).opacity).toBe(0);
    expect(pose({ ...base, gallery: 1, looseVisibility: 0 }, 1).opacity).toBeGreaterThan(0.5);
  });

  it("keeps the static (reduced-motion) gallery clear of the hero text column at common aspect ratios", () => {
    for (const aspect of [1.6, 1.78, 2.1]) {
      for (let i = 0; i < 4; i++) {
        const out = pose({ ...base, isStatic: true, position: 1.5, weights: [0.25, 0.25, 0.25, 0.25], gallery: 0.85, aspect }, i);
        const depth = 7 - out.z;
        const halfWidth = TAN_HALF_FOV * depth * aspect;
        const leftEdge = (out.x - out.width / 2) / halfWidth;
        expect(leftEdge, `panel ${i} at aspect ${aspect}`).toBeGreaterThan(KEYFRAMES.hero.columnEnd - 0.02);
      }
    }
  });

  it("holds the tablet gallery to the right edge so it does not cross the single-column copy", () => {
    for (const aspect of [0.75, 1.33]) {
      const active = pose({ ...base, tablet: true, aspect, position: 1, weights: [0, 1, 0, 0] }, 1);
      const depth = 7 - active.z;
      const halfWidth = TAN_HALF_FOV * depth * aspect;
      const leftEdge = (active.x - active.width / 2) / halfWidth;
      expect(leftEdge, `aspect ${aspect}`).toBeGreaterThan(0.2);
    }
  });
});
