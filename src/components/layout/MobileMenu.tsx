"use client";

import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/navigation";
import { useActiveSection } from "@/hooks/useActiveSection";

const ids = navItems.map((item) => item.id);
const PANEL_ID = "mobile-nav";

/**
 * Compact menu for < lg. A disclosure (not a dialog): no focus trap, closes on Escape,
 * on navigation, on outside pointer and when focus leaves. The panel is anchored to the fixed header.
 */
export function MobileMenu({ resumeHref }: { resumeHref: string | null }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection(ids);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="lg:hidden"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((value) => !value)}
        className="my-1 inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-silver transition-colors hover:border-mist hover:text-white"
      >
        Menu
        <span aria-hidden className="relative block h-2.5 w-3.5">
          <span className={`absolute inset-x-0 h-px bg-current transition-all duration-200 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
          <span className={`absolute inset-x-0 top-1/2 h-px bg-current transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute inset-x-0 h-px bg-current transition-all duration-200 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`} />
        </span>
      </button>

      <div id={PANEL_ID} hidden={!open} className="absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-b border-line bg-abyss shadow-[0_24px_40px_-20px_rgba(0,0,0,0.8)]">
        <nav aria-label="Primary" className="mx-auto max-w-6xl px-6 pb-5 pt-2 sm:px-8">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="border-b border-line/60">
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-12 items-center justify-between text-base transition-colors hover:text-white ${
                    active === item.id ? "text-white" : "text-silver"
                  }`}
                >
                  {item.label}
                  {active === item.id && <span aria-hidden className="size-1.5 rounded-full bg-accent" />}
                </a>
              </li>
            ))}
          </ul>
          {resumeHref && (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-abyss transition-colors hover:bg-white"
            >
              Resume
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
