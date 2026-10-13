import type { ArchitectureNote } from "@/types/content";

// Only topics grounded in the resume or the source repositories. Each note: concept, why it matters,
// the trade-off that exists, and where it shows up in real work.
export const notes: ArchitectureNote[] = [
  {
    id: "streaming-ui",
    title: "Streaming UI architecture",
    concept: "Treat a streamed AI response as a typed event sequence, not a string that grows.",
    why: "Text, structured data, charts, progress, errors and completion each have their own shape, and loading, failure and cancellation become real message states instead of UI afterthoughts.",
    tradeoff: "More up-front modelling than appending to a string, and the event types become a contract that the transport and the UI must keep in sync.",
    applied: "Client-side streaming at Tellius; the AI Analytics Interaction Console.",
  },
  {
    id: "event-driven",
    title: "Event-driven frontend systems",
    concept: "When data arrives over time, events are a better contract than request and response.",
    why: "Execution monitoring and cross-app communication both depend on updates that nobody asked for at a specific moment. A small, typed vocabulary keeps them understandable.",
    tradeoff: "Events need validation at the boundary and a deliberately small vocabulary, or they decay into untyped messaging.",
    applied: "WebSocket execution events in the Workflow Builder; the schema-validated event bus in the Federation Platform.",
  },
  {
    id: "virtualization",
    title: "Virtualization",
    concept: "Large lists and long histories should cost the same to render at any length.",
    why: "Dashboards, conversations and execution logs grow without bound; rendering only what is visible keeps the DOM small and interaction responsive.",
    tradeoff: "More moving parts than a plain list (measuring rows, scroll position), so it is worth it only where length is genuinely unbounded.",
    applied: "Large-data experiences at Tellius; conversation history in the AI console; execution history in the Workflow Builder.",
  },
  {
    id: "cancel-retry",
    title: "Retry and cancellation lifecycle",
    concept: "Cancellation and retry work best as part of the data model, not bolted onto the UI.",
    why: "A request can stop mid-stream and a failed one can be offered again deliberately, because cancelled and failed are distinct states.",
    tradeoff: "Retrying everything hides real failures, so only retryable errors should be retried; a contract mismatch should surface at once.",
    applied: "Message lifecycle in the AI console; the loader in the Federation Platform; retry and error flows in Tellius SSO work.",
  },
  {
    id: "design-systems",
    title: "Design-system architecture",
    concept: "A component library earns its keep by removing decisions, not by adding options.",
    why: "Consistent, accessible components make features cheaper to build, and accessibility lives in the component so every consumer inherits it.",
    tradeoff: "A shared library couples every team that uses it, so each extra option is a maintenance cost.",
    applied: "The reusable component library at Groyyo (about 40% less feature effort); design-system components at Tellius.",
  },
  {
    id: "federation",
    title: "Micro-frontend and Module Federation",
    concept: "Independent deployment only works when boundaries are explicit and failures are contained.",
    why: "Remotes are resolved at runtime from a validated registry and wrapped in boundaries, so one failure does not take down the shell.",
    tradeoff: "React and the router must be shared singletons, which couples versions; everything else is bundled per app, trading duplication for independence.",
    applied: "The Frontend Federation Platform.",
  },
];
