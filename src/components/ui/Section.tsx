interface SectionProps {
  id: string;
  /** Two-digit position, shown as "01 / LABEL". */
  index: string;
  label: string;
  title: React.ReactNode;
  children: React.ReactNode;
}

/** Page section with a consistent numbered eyebrow and heading. `id` doubles as the nav anchor. */
export function Section({ id, index, label, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <header data-reveal className="mb-12 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="text-mist">{index}</span> / {label}
          </p>
          <h2 id={`${id}-title`} className="mt-3 font-display text-3xl font-light text-white sm:text-5xl">
            {title}
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
}
