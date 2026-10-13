import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadSite() {
  vi.resetModules();
  return import("./site");
}

describe("site URL", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and strips a trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test/");
    const { SITE_URL, absoluteUrl } = await loadSite();
    expect(SITE_URL).toBe("https://example.test");
    expect(absoluteUrl("/sitemap.xml")).toBe("https://example.test/sitemap.xml");
  });

  it("falls back to Vercel's production URL, then the deployment URL, then localhost for development only", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "example.com");
    vi.stubEnv("VERCEL_URL", "preview-abc.vercel.app");
    expect((await loadSite()).SITE_URL).toBe("https://example.com");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect((await loadSite()).SITE_URL).toBe("https://preview-abc.vercel.app");
    vi.stubEnv("VERCEL_URL", "");
    expect((await loadSite()).SITE_URL).toBe("http://localhost:3000");
  });

  it("never falls back to the old placeholder domain", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect((await loadSite()).SITE_URL).not.toContain("nithinraj.dev");
  });
});
