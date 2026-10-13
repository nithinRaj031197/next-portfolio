import { experience } from "@/content/experience";
import { highlightMetrics } from "@/lib/highlight-metrics";
import { Section } from "@/components/ui/Section";
import { TagList } from "@/components/ui/Tag";

/**
 * Scan order per role: when, who, what the role was, the numbers the resume states, then the evidence.
 * The timeline marker is decorative; the semantic structure is an ordered list of articles with <time>.
 */
export function Experience() {
  return (
    <Section id="experience" index="02" label="Experience" title="4+ years across product teams and consulting.">
      <ol className="relative ml-[3px] border-l border-line">
        {experience.map((role, index) => (
          <li key={role.id} className="relative pl-7 md:pl-10">
            <span
              aria-hidden
              className={`absolute -left-[5px] top-[2.9rem] size-[9px] rounded-full border ${
                index === 0 ? "border-accent bg-accent" : "border-mist/60 bg-abyss"
              }`}
            />
            <article aria-labelledby={`role-${role.id}`} data-role={role.id} data-reveal className="grid grid-cols-1 gap-4 py-10 md:grid-cols-[170px_1fr] md:gap-10">
              <p className="font-mono text-sm text-mist">
                <time dateTime={role.startIso}>{role.start}</time> – {role.endIso ? <time dateTime={role.endIso}>{role.end}</time> : <span>{role.end}</span>}
                <span className="mt-1 block text-xs">{role.location}</span>
              </p>
              <div>
                <h3 id={`role-${role.id}`} className="text-xl font-medium text-white">
                  {role.title}
                </h3>
                <p className="mt-0.5 text-silver">{role.company}</p>
                <p className="mt-2 text-mist">{role.summary}</p>

                {role.metrics && (
                  <ul aria-label={`${role.company} results`} className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                    {role.metrics.map((metric) => (
                      <li key={metric.label}>
                        <span className="font-mono text-xl text-white">{metric.value}</span>
                        <span className="block text-xs text-mist">{metric.label}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="mt-5 list-disc space-y-2 pl-5 text-silver marker:text-accent/60">
                  {role.highlights.map((item) => (
                    <li key={item}>{highlightMetrics(item)}</li>
                  ))}
                </ul>
                {role.also && (
                  <p className="mt-4 text-sm text-mist">
                    <span className="font-mono text-xs uppercase tracking-[0.14em]">Also · </span>
                    {role.also.join(" · ")}
                  </p>
                )}
                <div className="mt-5">
                  <TagList items={role.stack} label={`${role.company} technologies`} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </Section>
  );
}
