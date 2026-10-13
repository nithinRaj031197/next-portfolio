// Single source for the canonical origin. Metadata, sitemap, robots, JSON-LD and the social images all derive from here.
//
// Resolution order:
//   1. NEXT_PUBLIC_SITE_URL (set this for production)
//   2. Vercel's system URLs (production domain, then the deployment URL) so previews work with no configuration
//   3. http://localhost:3000, for local development only
// A production build with none of these fails (see next.config.mjs), so a wrong canonical URL cannot ship silently.
const LOCAL_FALLBACK = "http://localhost:3000";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return LOCAL_FALLBACK;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Nithin Raj";

export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).toString();
