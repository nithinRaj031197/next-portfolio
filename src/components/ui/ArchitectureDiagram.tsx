import type { ArchitectureStage } from "@/types/content";

interface ArchitectureDiagramProps {
  title: string;
  stages: ArchitectureStage[];
}

/** Ordered system-architecture diagram as semantic HTML. The 3D ProjectWorld reuses this data. */
export function ArchitectureDiagram({ title, stages }: ArchitectureDiagramProps) {
  return (
    <figure className="self-start rounded-lg border border-line bg-deep/80 p-5">
      <figcaption className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-mist">
        System architecture · case study
        <span className="sr-only"> for {title}</span>
      </figcaption>
      <ol className="relative">
        {stages.map((stage, index) => (
          <li key={stage.label} className="relative pb-4 pl-8 last:pb-0">
            {index < stages.length - 1 && (
              <span aria-hidden className="absolute left-[9px] top-5 h-full w-px bg-line" />
            )}
            <span
              aria-hidden
              className="absolute left-0 top-1 flex size-[19px] items-center justify-center rounded-full border border-accent/50 bg-abyss font-mono text-[10px] text-accent"
            >
              {index + 1}
            </span>
            <p className="text-sm font-medium text-white">{stage.label}</p>
            {stage.detail && <p className="font-mono text-xs text-mist">{stage.detail}</p>}
          </li>
        ))}
      </ol>
    </figure>
  );
}
