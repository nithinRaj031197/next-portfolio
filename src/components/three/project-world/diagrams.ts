import type { ProjectId } from "@/lib/project-focus";

/**
 * Data-driven architecture diagrams for the project panels. Coordinates are panel-local: x and y in -0.5..0.5, y up.
 * These are simplified *system architecture* sketches of each case study: the same stages the HTML diagram lists
 * (src/content/projects.ts), arranged spatially. No text is rendered in WebGL; the HTML carries every label.
 */

/** World size of a gallery panel; node sizes below are fractions of it. */
export const PANEL_WIDTH = 5.4;
export const PANEL_HEIGHT = 3.4;

export type Tone = "normal" | "failure";
/** How an edge leaves the first node and enters the second: `auto` picks straight/vertical/elbow. */
export type Route = "auto" | "hv" | "vh";

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: Tone;
  /** Kept in the reduced (low-tier / mobile) diagram. Supporting concepts and failure paths are not. */
  essential?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  route?: Route;
  tone?: Tone;
}

export interface DiagramDef {
  id: ProjectId;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** Chains of node ids a pulse travels along, in order. Each consecutive pair must be an edge. */
  flows: string[][];
}

/**
 * The 3D diagram is an ambient systems visualization (topology, flow, depth), not the readable explanation: the
 * HTML card beside it carries labels and terminology. So nodes are small junction squares, not label-sized boxes,
 * and the weight of the picture sits in the routed lines and the travelling pulse.
 */
const NODE = { w: 0.045, h: 0.072 };
const SMALL = { w: 0.036, h: 0.058 };
const CHIP = { w: 0.024, h: 0.04 };

const node = (id: string, x: number, y: number, extra: Partial<DiagramNode> = {}): DiagramNode => ({ id, x, y, ...NODE, essential: true, ...extra });
const small = (id: string, x: number, y: number, extra: Partial<DiagramNode> = {}): DiagramNode => node(id, x, y, { ...SMALL, ...extra });
const chip = (id: string, x: number, y: number, tone: Tone = "normal"): DiagramNode => node(id, x, y, { ...CHIP, tone, essential: false });
const chain = (ids: string[], route: Route = "auto"): DiagramEdge[] => ids.slice(1).map((to, i) => ({ from: ids[i]!, to, route }));

// AI Analytics Interaction Console: request -> stream -> typed events -> state -> virtualized UI -> charts.
const aiConsole: DiagramDef = {
  id: "ai-console",
  nodes: [
    node("prompt", -0.38, 0.17),
    node("request", -0.14, 0.17),
    node("transport", 0.1, 0.17),
    node("protocol", 0.34, 0.17),
    // The event kinds the protocol carries: text, structured data, progress, chart, completion, error.
    ...["text", "data", "progress", "chart", "done"].map((id, i) => chip(`event-${id}`, 0 + i * 0.06, 0.04)),
    chip("event-error", 0.3, 0.04, "failure"),
    node("state", 0.34, -0.2),
    node("ui", 0, -0.2),
    node("visualization", -0.34, -0.2),
  ],
  edges: chain(["prompt", "request", "transport", "protocol", "state", "ui", "visualization"]),
  flows: [["prompt", "request", "transport", "protocol", "state", "ui", "visualization"]],
};

// Visual Workflow Builder: editor (canvas -> config -> validation) -> execution graph -> WebSocket events -> progress/logs.
const workflowBuilder: DiagramDef = {
  id: "workflow-builder",
  nodes: [
    node("canvas", -0.38, 0.2),
    node("config", -0.38, 0),
    node("validation", -0.38, -0.2),
    // Undo/redo, auto-save, versioning.
    chip("history-undo", -0.44, -0.4),
    chip("history-save", -0.38, -0.4),
    chip("history-version", -0.32, -0.4),
    // A small execution graph: one branch point and a join.
    small("g0", -0.19, 0.08),
    small("g1", -0.07, 0.08),
    small("g2", 0.05, 0.18),
    small("g3", 0.05, -0.02, { essential: false }),
    small("g4", 0.17, 0.08),
    node("events", 0.38, 0.08),
    node("progress", 0.38, -0.1),
    node("logs", 0.38, -0.28),
    // Cancellation and retry.
    chip("run-cancel", 0.35, -0.4, "failure"),
    chip("run-retry", 0.41, -0.4, "failure"),
  ],
  edges: [
    ...chain(["canvas", "config", "validation"]),
    { from: "validation", to: "g0", route: "hv" },
    { from: "g0", to: "g1" },
    { from: "g1", to: "g2", route: "hv" },
    { from: "g1", to: "g3", route: "hv" },
    { from: "g2", to: "g4", route: "hv" },
    { from: "g3", to: "g4", route: "hv" },
    ...chain(["g4", "events", "progress", "logs"]),
  ],
  flows: [["canvas", "config", "validation", "g0", "g1", "g2", "g4", "events", "progress", "logs"]],
};

// Pre-Owned Vehicle Operations Platform: the vehicle lifecycle, and the application's Sheets gateway.
const vehicleOps: DiagramDef = {
  id: "vehicle-ops",
  nodes: [
    ...["acquisition", "inspection", "purchase", "refurbishment", "inventory", "sale", "profitability"].map((id, i) => node(id, -0.42 + i * 0.14, 0.14)),
    node("app", -0.36, -0.2, { essential: false }),
    node("auth", -0.12, -0.2, { essential: false }),
    node("gateway", 0.12, -0.2, { essential: false }),
    node("sheets", 0.36, -0.2, { essential: false }),
  ],
  edges: [...chain(["acquisition", "inspection", "purchase", "refurbishment", "inventory", "sale", "profitability"]), ...chain(["app", "auth", "gateway", "sheets"])],
  flows: [
    ["acquisition", "inspection", "purchase", "refurbishment", "inventory", "sale", "profitability"],
    ["app", "auth", "gateway", "sheets"],
  ],
};

// Frontend Federation Platform: host -> registry -> contract validation -> origin allowlist -> runtime -> remote, with the failure paths the repo handles.
const federation: DiagramDef = {
  id: "federation",
  nodes: [
    node("host", -0.4, 0.17),
    node("registry", -0.24, 0.17),
    node("validation", -0.08, 0.17),
    node("origin", 0.08, 0.17),
    node("runtime", 0.24, 0.17),
    node("remote", 0.4, 0.17),
    small("invalid-entry", -0.24, -0.07, { tone: "failure", essential: false }),
    small("contract-mismatch", -0.08, -0.07, { tone: "failure", essential: false }),
    small("origin-rejected", 0.08, -0.07, { tone: "failure", essential: false }),
    small("remote-unavailable", 0.24, -0.07, { tone: "failure", essential: false }),
    // The error boundary collects every failure path: drawn as a thin bus rather than a box.
    node("error-boundary", 0, -0.28, { w: 0.56, h: 0.024, tone: "failure", essential: false }),
  ],
  edges: [
    ...chain(["host", "registry", "validation", "origin", "runtime", "remote"]),
    { from: "registry", to: "invalid-entry", tone: "failure" },
    { from: "validation", to: "contract-mismatch", tone: "failure" },
    { from: "origin", to: "origin-rejected", tone: "failure" },
    { from: "runtime", to: "remote-unavailable", tone: "failure" },
    { from: "invalid-entry", to: "error-boundary", tone: "failure" },
    { from: "contract-mismatch", to: "error-boundary", tone: "failure" },
    { from: "origin-rejected", to: "error-boundary", tone: "failure" },
    { from: "remote-unavailable", to: "error-boundary", tone: "failure" },
  ],
  flows: [["host", "registry", "validation", "origin", "runtime", "remote"]],
};

/** Same order as `PROJECT_IDS` and the HTML. */
export const DIAGRAMS: DiagramDef[] = [aiConsole, workflowBuilder, vehicleOps, federation];
