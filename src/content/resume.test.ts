import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadProfile() {
  vi.resetModules();
  return (await import("./profile")).profile;
}

describe("resume link", () => {
  it("uses the configured public URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_RESUME_URL", " https://example.test/resume.pdf ");
    expect((await loadProfile()).resumeHref).toBe("https://example.test/resume.pdf");
  });

  it("is null when unset, so no Resume link can point at a missing or private file", async () => {
    vi.stubEnv("NEXT_PUBLIC_RESUME_URL", "");
    expect((await loadProfile()).resumeHref).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_RESUME_URL", "   ");
    expect((await loadProfile()).resumeHref).toBeNull();
  });

  it("ships no résumé file and no phone number in the profile data", async () => {
    const profile = await loadProfile();
    expect(JSON.stringify(profile)).not.toMatch(/(?<![\w.])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w.])|tel:/);
    expect(profile.resumeHref ?? "").not.toContain("Nithin_Raj_Resume");
  });
});
