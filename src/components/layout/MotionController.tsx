"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Fraction of the viewport height, from the bottom, below which an element is not yet considered "arriving". */
const ARRIVAL_MARGIN = "0px 0px -8% 0px";

/** Elements already on screen when motion switches on are shown immediately, so nothing flashes. */
function revealVisibleNow(elements: Element[]) {
  const limit = window.innerHeight * 0.92;
  for (const element of elements) {
    if (element.getBoundingClientRect().top < limit) element.setAttribute("data-revealed", "");
  }
}

/** The details element a deep link just opened. Its asynchronous `toggle` event must not rewrite the URL: it already matches. */
let openedByHash: Element | null = null;

function openCaseStudyFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) {
    if (!target.open) openedByHash = target;
    target.open = true;
    target.scrollIntoView({ block: "start" });
  }
}

/**
 * Progressive enhancement for the DOM layer, rendered once in the layout:
 *  - scroll reveals (`[data-reveal]`), skipped entirely for reduced motion;
 *  - case studies and notes (`details[id]`) open from `#id` deep links and keep the URL in sync as they open.
 * Without JavaScript none of this runs and every element is simply visible.
 */
export function MotionController() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // No IntersectionObserver (very old browsers) or reduced motion: never hide anything.
    if (reduced || typeof IntersectionObserver === "undefined") return;
    const elements = [...document.querySelectorAll("[data-reveal]")];
    revealVisibleNow(elements);

    // IntersectionObserver only reports changes, so an element that jumps from below the viewport to above it
    // without ever intersecting (an instant scroll) would never be reported. Elements are in document order,
    // so whenever one arrives, everything before it is above the viewport and is revealed with it.
    const reveal = (target: Element) => {
      const upTo = elements.indexOf(target);
      for (let i = 0; i <= upTo; i++) {
        const element = elements[i]!;
        if (element.hasAttribute("data-revealed")) continue;
        element.setAttribute("data-revealed", "");
        observer.unobserve(element);
      }
    };

    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // Intersecting, or already scrolled past: reveal, never wait.
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) reveal(entry.target);
          }
        },
        { rootMargin: ARRIVAL_MARGIN },
      );
    } catch {
      return; // reveals are optional: leave everything visible
    }
    for (const element of elements) if (!element.hasAttribute("data-revealed")) observer.observe(element);
    // Hiding is switched on last, only once everything it depends on exists.
    document.documentElement.dataset.motion = "on";

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.motion;
    };
  }, [reduced]);

  useEffect(() => {
    openCaseStudyFromHash();
    window.addEventListener("hashchange", openCaseStudyFromHash);

    const onToggle = (event: Event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.dataset.caseStudy) return;
      if (details === openedByHash) {
        openedByHash = null;
        return;
      }
      const hash = `#${details.id}`;
      // replaceState does not scroll, and keeps the back button free of case-study toggles.
      if (details.open) window.history.replaceState(null, "", hash);
      else if (window.location.hash === hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    document.addEventListener("toggle", onToggle, true);
    return () => {
      window.removeEventListener("hashchange", openCaseStudyFromHash);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);

  return null;
}
