import { profile } from "@/content/profile";

const linkClass = "group flex items-center justify-between gap-4 border-t border-line py-4 text-silver transition-colors duration-200 hover:text-white";

export function Contact() {
  const links = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "LinkedIn", value: "nithin-raj-831108214", href: profile.links.linkedin },
    { label: "GitHub", value: "nithinRaj031197", href: profile.links.github },
    ...(profile.resumeHref ? [{ label: "Resume", value: "Download PDF", href: profile.resumeHref }] : []),
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span className="text-mist">06</span> / Contact
          </p>
          <h2 id="contact-title" className="mt-3 font-display text-4xl font-light text-white sm:text-6xl">
            Let&apos;s build software people enjoy using.
          </h2>
          <p className="mt-6 max-w-md text-mist">{profile.openTo}. The fastest way to reach me is email.</p>
        </div>
        <ul data-reveal aria-label="Contact links" className="self-start border-b border-line">
          {links.map((link) => {
            const external = link.href.startsWith("http");
            const file = link.href.endsWith(".pdf");
            return (
              <li key={link.label}>
                <a href={link.href} {...(external || file ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={linkClass}>
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-mist">{link.label}</span>
                  <span className="min-w-0 break-words text-right text-sm">
                    {link.value}
                    <span aria-hidden className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                      ↗
                    </span>
                    {(external || file) && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
