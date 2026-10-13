import { certifications, education, pillars } from "@/content/profile";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" index="01" label="Profile" title="Interfaces that stay understandable as they scale.">
      <p data-reveal className="mb-12 max-w-2xl text-lg text-silver">
        4+ years of building React and TypeScript applications, from administrative systems to an AI-powered analytics platform. I care about how an
        interface is structured as much as how it looks.
      </p>
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {pillars.map((pillar, index) => (
          <li key={pillar.title} data-reveal style={{ "--reveal-i": index % 2 } as React.CSSProperties} className="bg-abyss p-6 sm:p-8">
            <p className="font-mono text-xs text-accent">0{index + 1}</p>
            <h3 className="mt-3 text-lg font-medium text-white">{pillar.title}</h3>
            <p className="mt-2 text-mist">{pillar.body}</p>
          </li>
        ))}
      </ul>

      <dl data-reveal className="mt-10 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-mist">Education</dt>
          <dd className="mt-2 text-silver">{education.degree}</dd>
          <dd className="text-mist">
            {education.school} · {education.period} · {education.score}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-mist">Certifications</dt>
          {certifications.map((cert) => (
            <dd key={cert.name} className="mt-2 text-silver first:mt-2">
              {cert.name}
              <span className="text-mist">
                {" "}
                · {cert.issuer} · {cert.period}
              </span>
            </dd>
          ))}
        </div>
      </dl>
    </Section>
  );
}
