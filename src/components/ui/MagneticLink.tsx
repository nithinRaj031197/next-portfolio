"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { ButtonLink } from "./ButtonLink";

const MAX_OFFSET_PX = 4;

/**
 * A primary CTA that leans a few pixels toward the pointer. Pointer devices only: no effect on touch, none for
 * reduced motion, and the markup is a plain link until it hydrates.
 */
export function MagneticLink(props: ComponentProps<typeof ButtonLink>) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      element.style.transform = `translate(${(dx * MAX_OFFSET_PX).toFixed(2)}px, ${(dy * MAX_OFFSET_PX).toFixed(2)}px)`;
    };
    const onLeave = () => {
      element.style.transform = "";
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.style.transform = "";
    };
  }, []);

  return <ButtonLink ref={ref} {...props} />;
}
