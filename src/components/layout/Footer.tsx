import { profile } from "@/content/profile";

const link = "link-underline py-1 hover:text-white";

export function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-sm sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-silver">{profile.name}</p>
          <p className="text-mist">
            {profile.headline} · {profile.location}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-mist">
          <li>
            <a href={`mailto:${profile.email}`} className={link}>
              Email
            </a>
          </li>
          <li>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className={link}>
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-6 font-mono text-xs text-mist sm:px-8">Built with Next.js, TypeScript and React Three Fiber.</p>
    </footer>
  );
}
