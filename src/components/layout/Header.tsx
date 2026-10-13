import { profile } from "@/content/profile";
import { navItems } from "@/lib/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-abyss/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 sm:px-8">
        <a href="#top" className="py-3 font-mono text-sm tracking-wide text-white">
          {profile.name}
        </a>
        <NavLinks />
        {profile.resumeHref && (
          <div className="hidden lg:block">
            <ButtonLink href={profile.resumeHref} variant="secondary" className="my-2 px-4 py-1.5">
              Resume
            </ButtonLink>
          </div>
        )}
        <MobileMenu resumeHref={profile.resumeHref} />
      </div>
      {/* Without JavaScript the disclosure menu cannot open, so show plain links instead. */}
      <noscript>
        <nav aria-label="Primary" className="border-t border-line/70 lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-4 px-6 py-2 text-sm text-silver sm:px-8">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>
    </header>
  );
}
