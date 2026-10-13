import { notes } from "@/content/notes";
import { Section } from "@/components/ui/Section";

const ROWS = [
  { key: "why", label: "Why it matters" },
  { key: "tradeoff", label: "Trade-off" },
  { key: "applied", label: "Where I applied it" },
] as const;

/** Collapsed: the concept in one line. Expanded: why it matters, the trade-off, and where it appears in real work. */
export function ArchitectureNotes() {
  return (
    <Section id="architecture" index="04" label="Architecture" title="How I think about frontend systems.">
      <ul className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {notes.map((note, index) => (
          <li key={note.id} data-reveal style={{ "--reveal-i": index % 2 } as React.CSSProperties}>
            <details id={`note-${note.id}`} className="group scroll-mt-24 rounded-lg border border-line bg-deep/60 transition-colors duration-200 open:border-mist/35 hover:border-mist/30">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg p-5 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 break-words">
                  <h3 className="text-lg font-medium text-white">{note.title}</h3>
                  <span className="mt-1 block text-mist">{note.concept}</span>
                </span>
                <span
                  aria-hidden
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-accent transition-[transform,border-color] duration-200 group-hover:border-accent/60 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dl className="space-y-4 border-t border-line px-5 py-5">
                {ROWS.map((row) => (
                  <div key={row.key}>
                    <dt className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{row.label}</dt>
                    <dd className="mt-1 text-silver">{note[row.key]}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </li>
        ))}
      </ul>
    </Section>
  );
}
