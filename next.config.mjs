import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";

/**
 * A production build must know its public origin: the canonical URL, Open Graph, sitemap, robots and JSON-LD are all
 * derived from it. Fail loudly instead of publishing localhost (or a guess) as the canonical address.
 * Vercel provides its own URLs automatically; for other hosts set NEXT_PUBLIC_SITE_URL.
 */
function assertSiteUrl() {
  const known = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (known || process.env.ALLOW_MISSING_SITE_URL === "1") return;
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. Set it to the production origin (for example https://example.com) before running `next build`. " +
      "For a throwaway local build only, set ALLOW_MISSING_SITE_URL=1.",
  );
}

/** Surfaced at build time because a missing résumé silently removes every Resume link. */
function warnAboutResume() {
  if (!process.env.NEXT_PUBLIC_RESUME_URL?.trim()) {
    console.warn("\n[portfolio] NEXT_PUBLIC_RESUME_URL is not set: the site will build without any Resume links.\n");
  }
}

export default function config(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) {
    assertSiteUrl();
    warnAboutResume();
  }

  // Development-only routes (`page.dev.tsx`, e.g. the fish lab) exist only while developing: in a production build the
  // extension is not a page extension, so those routes are not compiled, bundled or routable. No runtime guard to trust.
  const pageExtensions = phase === PHASE_DEVELOPMENT_SERVER ? ["tsx", "ts", "dev.tsx", "dev.ts"] : ["tsx", "ts"];

  /** @type {import('next').NextConfig} */
  return {
    reactStrictMode: true,
    pageExtensions,
    images: { formats: ["image/avif", "image/webp"] },
    // A stray lockfile in $HOME confuses root detection; pin it to this repo.
    turbopack: { root: path.dirname(fileURLToPath(import.meta.url)) },
  };
}
