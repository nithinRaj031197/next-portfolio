import { projects } from "@/content/projects";
import { Section } from "@/components/ui/Section";
import { TagList } from "@/components/ui/Tag";
import { ArchitectureDiagram } from "@/components/ui/ArchitectureDiagram";
import type { CaseStudyKind, Project } from "@/types/content";

const GROUPS: { kind: CaseStudyKind; label: string }[] = [
  { kind: "approach", label: "Engineering approach" },
  { kind: "architecture", label: "Architecture" },
  { kind: "challenge", label: "Key challenges" },
  { kind: "quality", label: "Quality" },
  { kind: "scope", label: "Scope" },
];

/** Groups only the kinds a project has real content for; nothing is padded to fill a template. */
function groupCaseStudy(project: Project) {
  return GROUPS.map((group) => ({ ...group, sections: project.caseStudy.filter((section) => section.kind === group.kind) })).filter(
    (group) => group.sections.length > 0,
  );
}

/**
 * Three layers, so a recruiter and an engineer can use the same page differently:
 *  1. Scan: name, positioning, stack, the strongest points.
 *  2. Understand: the problem and the architecture diagram (readable: the 3D layer is only ambient).
 *  3. Deep dive: an inline, native <details> case study, deep-linkable at #case-<id>.
 * The `data-project` hook is what the WebGL layer follows.
 */
function ProjectArticle({ project, index }: { project: Project; index: number }) {
  const groups = groupCaseStudy(project);

  return (
    <article id={`project-${project.id}`} data-project={project.id} data-reveal aria-labelledby={`${project.id}-title`} className="scroll-mt-24 border-t border-line py-12">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          <span className="text-mist">0{index + 1}</span> · {project.kind}
        </p>
        <h3 id={`${project.id}-title`} className="mt-3 text-2xl font-medium text-white sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 text-lg text-silver">{project.positioning}</p>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <TagList items={project.stack} label={`${project.title} technologies`} />
          <ul className="mt-6 list-disc space-y-2 pl-5 text-silver marker:text-accent/60">
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-mist">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent/80">Problem </span>
            {project.context}
          </p>

          <details id={`case-${project.id}`} data-case-study={project.id} className="group mt-8 scroll-mt-24 rounded-lg border border-line bg-deep/60 transition-colors duration-200 open:border-mist/35">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-3.5 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">Case study</span>
                <span className="block text-xs text-mist">{groups.map((group) => group.label).join(" · ")}</span>
              </span>
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-accent transition-[transform,border-color] duration-200 group-hover:border-accent/60 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="space-y-7 border-t border-line px-5 py-6">
              {groups.map((group) => (
                <section key={group.kind} aria-label={group.label}>
                  <h4 className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{group.label}</h4>
                  <dl className="mt-3 space-y-4">
                    {group.sections.map((section) => (
                      <div key={section.heading}>
                        <dt className="text-sm font-medium text-white">{section.heading}</dt>
                        <dd className="mt-1 text-silver">{section.body}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            {project.repo && (
              <p className="border-t border-line px-5 py-4 text-sm">
                <a href={project.repo} target="_blank" rel="noopener noreferrer" className="link-underline text-accent hover:text-white">
                  View source <span aria-hidden>↗</span><span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </details>
        </div>
        <ArchitectureDiagram title={project.title} stages={project.architecture} />
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <Section id="projects" index="03" label="Projects" title="Systems I have designed and built.">
      <div className="-mt-4">
        {projects.map((project, index) => (
          <ProjectArticle key={project.id} project={project} index={index} />
        ))}
      </div>
    </Section>
  );
}
