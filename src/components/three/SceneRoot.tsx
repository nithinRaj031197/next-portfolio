"use client";

// Client boundary for the whole WebGL subtree: everything it imports (Scene and below) is client-only by reachability,
// so those modules carry no directive of their own.
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneQuality } from "@/hooks/useSceneQuality";
import { EnhancementBoundary } from "@/components/layout/EnhancementBoundary";

// ssr: false keeps three.js out of the server render; the dynamic import also splits it into its own chunk.
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Resolves once the page has loaded and the browser is idle, so WebGL never competes with first paint. */
function useWhenIdle() {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cancel: (() => void) | undefined;
    const start = () => {
      if (cancelled) return;
      const reveal = () => {
        if (!cancelled) setIdle(true);
      };
      if (typeof window.requestIdleCallback === "function") {
        const handle = window.requestIdleCallback(reveal, { timeout: 2500 });
        cancel = () => window.cancelIdleCallback(handle);
      } else {
        const handle = window.setTimeout(reveal, 800);
        cancel = () => window.clearTimeout(handle);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      cancel?.();
    };
  }, []);

  return idle;
}

export function SceneRoot() {
  const reducedMotion = useReducedMotion();
  const { tier, degrade, disable } = useSceneQuality(reducedMotion);
  const idle = useWhenIdle();

  if (!idle || !tier || tier === "none") return null;

  return (
    <EnhancementBoundary>
      <Scene tier={tier} reducedMotion={reducedMotion} onDegrade={degrade} onUnavailable={disable} />
    </EnhancementBoundary>
  );
}
