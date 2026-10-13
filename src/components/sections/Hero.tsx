import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MagneticLink } from "@/components/ui/MagneticLink";

const capabilities = ["Scalable frontend systems", "AI-powered interfaces", "Real-time applications", "Data-intensive experiences"];

/**
 * The opening screen answers three things without waiting for WebGL: who (name), what (frontend engineer,
 * the stack), and what next (one clear primary action, then two quieter ones). No entrance animation, so the
 * largest contentful paint is the text itself.
 */
export function Hero() {
  const current = experience[0];

  return (
    <section id="top" aria-labelledby="hero-title" className="pb-14 pt-32 sm:pb-24 sm:pt-40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {profile.yearsExperience} years · {profile.location}
          </p>
          <h1 id="hero-title" className="mt-5">
            <span className="block font-display text-5xl font-light tracking-tight text-white sm:text-7xl">{profile.name}</span>
            <span className="mt-3 block text-xl font-medium text-silver sm:text-2xl">{profile.headline}</span>
          </h1>
          <p className="mt-3 font-mono text-sm text-mist">React.js · Next.js · TypeScript · Frontend Architecture</p>
          <p className="mt-7 max-w-[34rem] text-base text-silver sm:text-lg">
            I design and build the frontend of complex products, with accessibility, performance and tests treated as part of the work.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
            <MagneticLink href="#projects" variant="primary" className="min-h-11">
              View Projects
            </MagneticLink>
            {profile.resumeHref && (
              <ButtonLink href={profile.resumeHref} variant="secondary" className="min-h-11">
                View Resume
              </ButtonLink>
            )}
            <ButtonLink href="#contact" variant="quiet" className="min-h-11">
              Contact Me
              <span aria-hidden>→</span>
            </ButtonLink>
          </div>
          <ul aria-label="Profiles" className="mt-5 flex gap-6 font-mono text-sm text-mist">
            <li>
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="link-underline py-1 hover:text-white">
                GitHub <span aria-hidden>↗</span><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline py-1 hover:text-white">
                LinkedIn <span aria-hidden>↗</span><span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>

        {/* The WebGL scene renders behind this column. */}
        <aside aria-label="At a glance" className="rounded-lg border border-line bg-deep/70 p-5 backdrop-blur-sm lg:mb-2">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">Most recent</dt>
              <dd className="mt-1 text-white">{current?.title}</dd>
              <dd className="text-mist">{current?.company}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">Focus</dt>
              <dd className="mt-1">
                <ul className="space-y-0.5 text-silver">
                  {capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mist">Open to</dt>
              <dd className="mt-1 text-silver">{profile.openTo.replace("Open to ", "")}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
