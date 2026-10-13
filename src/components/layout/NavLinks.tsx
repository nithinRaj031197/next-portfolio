"use client";

import { navItems } from "@/lib/navigation";
import { useActiveSection } from "@/hooks/useActiveSection";

const ids = navItems.map((item) => item.id);

/** Desktop navigation. Client island that only adds the active-section indicator; links work without JS. */
export function NavLinks() {
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1 whitespace-nowrap">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`relative block px-3 py-2 text-sm transition-colors duration-200 hover:text-white ${
                  isActive ? "text-white" : "text-mist"
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
