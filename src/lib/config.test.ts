import { afterEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error: next.config.mjs is plain JavaScript with no type declarations.
import config from "../../next.config.mjs";

const PRODUCTION_BUILD = "phase-production-build";
const DEVELOPMENT = "phase-development-server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("next.config: production site URL guard", () => {
  it("fails a production build that has no public origin, with an actionable message", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("ALLOW_MISSING_SITE_URL", "");
    expect(() => config(PRODUCTION_BUILD)).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("passes when the origin is configured, when Vercel supplies one, or when explicitly allowed", () => {
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("ALLOW_MISSING_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test");
    expect(() => config(PRODUCTION_BUILD)).not.toThrow();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    expect(() => config(PRODUCTION_BUILD)).not.toThrow();
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("ALLOW_MISSING_SITE_URL", "1");
    expect(() => config(PRODUCTION_BUILD)).not.toThrow();
  });

  it("never blocks local development", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    expect(() => config(DEVELOPMENT)).not.toThrow();
  });
});

describe("next.config: development-only routes", () => {
  it("compiles page.dev.tsx routes (the fish lab) only for the dev server", () => {
    expect(config(DEVELOPMENT).pageExtensions).toContain("dev.tsx");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test");
    expect(config(PRODUCTION_BUILD).pageExtensions).not.toContain("dev.tsx");
    expect(config("phase-production-server").pageExtensions).not.toContain("dev.tsx");
  });
});
