import type { Project } from "@/types/content";

// Public copy comes from the latest resume (and the federation source for that project).
// Professional case studies describe work experience; `repo` is only set when a public
// repository genuinely demonstrates the claims.
export const projects: Project[] = [
  {
    id: "ai-console",
    title: "AI Analytics Interaction Console",
    kind: "Streaming AI interface",
    positioning: "A typed streaming-message system that turns AI responses into incremental text, structured data and charts.",
    context:
      "AI responses arrive over time and in different shapes. A single growing string cannot express progress, charts or errors, cannot be cancelled cleanly and is hard to debug.",
    stack: ["React.js", "TypeScript", "SSE", "WebSockets", "TanStack Virtual", "ECharts"],
    highlights: [
      "Typed streaming-message system for incremental text, structured data, charts, progress events and errors.",
      "Cancellation and retry designed into the message lifecycle.",
      "Virtualized conversation history, progressive charts and trace identifiers to inspect latency and failures.",
    ],
    architecture: [
      { label: "User request" },
      { label: "Transport / streaming layer", detail: "SSE · WebSocket" },
      { label: "Typed event protocol", detail: "text · data · chart · progress · error" },
      { label: "Event normalization" },
      { label: "Application state" },
      { label: "Virtualized conversation UI", detail: "TanStack Virtual" },
      { label: "Progressive visualizations", detail: "ECharts" },
    ],
    caseStudy: [
      {
        heading: "Streaming event model",
        kind: "approach",
        body: "Responses are modelled as a stream of typed events rather than a string: incremental text, structured data, chart payloads, progress events and error responses each have their own shape, so the UI handles every case explicitly.",
      },
      {
        heading: "UI state transitions",
        kind: "approach",
        body: "A message moves through explicit states such as pending, streaming and completed, or ends as error or cancelled. Loading, failure and cancellation are part of the data model, not afterthoughts in the component tree.",
      },
      {
        heading: "Progressive rendering",
        kind: "approach",
        body: "Content and charts render as events arrive instead of waiting for the full response, so the interface stays responsive during long analytical answers.",
      },
      {
        heading: "Large conversation handling",
        kind: "challenge",
        body: "The conversation history is virtualized so long sessions keep a small, stable DOM regardless of message count.",
      },
      {
        heading: "Visualization lifecycle",
        kind: "challenge",
        body: "Chart events carry structured configuration that is rendered progressively with ECharts, from first data to the finished chart.",
      },
      {
        heading: "Cancellation, errors and retry",
        kind: "challenge",
        body: "A request can be cancelled mid-stream, errors arrive as typed events, and retry is a deliberate action on a failed or cancelled message.",
      },
      {
        heading: "Observability",
        kind: "architecture",
        body: "Every message carries message, request and trace identifiers, so latency and failures can be inspected end to end.",
      },
    ],
    internalNotes:
      "ai-console repo today: Zod stream-event protocol, provider-independent AI adapter with abort support, normalized Zustand store, ~60 tests. No SSE/WebSocket, ECharts, TanStack Virtual, tracing or retry yet. Do not link it as the full implementation.",
  },
  {
    id: "workflow-builder",
    title: "Visual Workflow Builder and Execution Monitor",
    kind: "Node-based editor",
    positioning: "A node-based workflow editor paired with real-time monitoring of every execution.",
    context:
      "Workflows need to be composed visually, validated before they run, and observed while they execute, down to the individual node.",
    stack: ["React.js", "TypeScript", "React Flow", "Zustand", "WebSockets"],
    highlights: [
      "Drag-and-drop composition with schema-driven node configuration and connection validation.",
      "Undo/redo, auto-save and versioning keep editing safe.",
      "Real-time execution monitoring: node-level progress, streamed logs, cancellation, retry and virtualized history.",
    ],
    architecture: [
      { label: "Nodes", detail: "drag-and-drop · schema-driven config" },
      { label: "Connection validation" },
      { label: "Execution graph" },
      { label: "WebSocket events" },
      { label: "Execution state", detail: "node-level progress" },
      { label: "Streamed logs", detail: "virtualized history" },
    ],
    caseStudy: [
      {
        heading: "Editor",
        kind: "approach",
        body: "A React Flow canvas with drag-and-drop composition, node configuration driven by schemas, and validation of connections between nodes. Undo/redo, auto-save and versioning keep editing safe.",
      },
      {
        heading: "Execution monitoring",
        kind: "architecture",
        body: "Executions are observed in real time over WebSockets, with node-level progress and streamed logs. Runs can be cancelled or retried, and execution history is virtualized.",
      },
    ],
  },
  {
    id: "vehicle-ops",
    title: "Pre-Owned Vehicle Operations Platform",
    kind: "Role-based operations app",
    positioning: "A role-based platform that follows a vehicle from acquisition to sale and tracks profitability per vehicle.",
    context:
      "Buying, inspecting, refurbishing and selling pre-owned vehicles involves several roles working on the same inventory, each with different permissions.",
    stack: ["Next.js", "TypeScript", "Google Sheets API", "Apps Script", "Cypress"],
    highlights: [
      "Covers acquisition, inspection, refurbishment, inventory, sales and vehicle-level profitability.",
      "Role-based architecture; Google Sheets integration secured through an HMAC-authenticated Apps Script gateway.",
      "Cypress E2E coverage for critical workflows and permissions.",
    ],
    architecture: [
      { label: "Role-based application", detail: "Next.js · TypeScript" },
      { label: "HMAC-authenticated request" },
      { label: "Apps Script gateway" },
      { label: "Google Sheets" },
    ],
    caseStudy: [
      {
        heading: "Operations coverage",
        kind: "approach",
        body: "One application spans the vehicle lifecycle: acquisition, inspection, refurbishment, inventory and sales, with profitability tracked at the level of each vehicle.",
      },
      {
        heading: "Access and security",
        kind: "architecture",
        body: "Access is role-based, and the Google Sheets integration goes through an Apps Script gateway that authenticates requests with HMAC.",
      },
      {
        heading: "Quality",
        kind: "quality",
        body: "Cypress end-to-end tests cover the critical workflows and the permission rules.",
      },
    ],
  },
  {
    id: "federation",
    title: "Frontend Federation Platform",
    kind: "Micro-frontend architecture showcase",
    positioning: "A React shell that composes independently built frontends at runtime with Webpack 5 Module Federation.",
    context:
      "Explores how independently deployable frontends can share a runtime without being coupled, and how the shell keeps working when one of them fails.",
    stack: ["React", "TypeScript", "Webpack 5 Module Federation", "Zod", "Web Components", "Vitest", "Playwright"],
    highlights: [
      "Runtime registry with validation and an origin allowlist; Zod contracts with a version rule enforced at load time.",
      "Error boundaries, typed loader errors, retry and timeout around every remote.",
      "About 210 unit, component and contract tests plus about 39 Playwright E2E tests.",
    ],
    architecture: [
      { label: "Shell", detail: "session · router · platform API" },
      { label: "Runtime registry", detail: "validated · origin allowlist" },
      { label: "Remote loader", detail: "retry · timeout · contract check" },
      { label: "Remote boundary", detail: "fallback · diagnostics" },
      { label: "Remotes", detail: "operations · analytics · settings" },
      { label: "Shared layer", detail: "web components · event bus · contracts" },
    ],
    caseStudy: [
      {
        heading: "Runtime composition",
        kind: "approach",
        body: "The shell fetches a registry at startup and validates it in two tiers, the document and then each entry. Invalid entries are skipped and reported, and remotes are only trusted from allowed origins.",
      },
      {
        heading: "Shared dependencies",
        kind: "approach",
        body: "React is a strict singleton and the router a singleton; everything else is bundled per app so remotes stay independent. A deliberate version mismatch can be reproduced to show negotiation failing in isolation.",
      },
      {
        heading: "Contracts",
        kind: "architecture",
        body: "Platform contracts are Zod schemas with a semver rule: same major version, and a remote's minor version no higher than the host's. The shell gives each remote a frozen platform API that never exposes tokens.",
      },
      {
        heading: "Failure isolation",
        kind: "challenge",
        body: "Typed loader errors, retry for retryable failures, timeouts, error boundaries with fallbacks and correlation IDs keep one failing remote from taking down the shell. A dev-only fault-injection harness exercises these paths and is compiled out of production builds.",
      },
      {
        heading: "Framework-neutral layer",
        kind: "architecture",
        body: "Shadow DOM web components, a typed event bus and CSS-variable design tokens are shared across the shell and remotes without sharing a framework runtime.",
      },
      {
        heading: "Testing",
        kind: "quality",
        body: "Unit, component and contract tests with Vitest, plus Playwright specs for the shell, federation, failure isolation, permissions and web components. ESLint rules enforce that apps never import each other.",
      },
      {
        heading: "Prototype scope",
        kind: "scope",
        body: "The platform runs a sample operations domain with seeded data and a demo session, so the focus stays on the architecture.",
      },
    ],
  },
];
