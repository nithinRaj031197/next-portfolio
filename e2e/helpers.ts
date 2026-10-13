import type { Page } from "@playwright/test";

/** Public, non-secret values the production build is made with (see playwright.config.ts and .github/workflows/ci.yml). */
export const TEST_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
export const TEST_RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? "https://example.com/resume.pdf";

/**
 * Everything on the page a visitor, crawler or scraper could read: visible text, every link target, every meta tag
 * and structured-data block. Used to prove the phone number never appears, without storing the number in the repo.
 */
export async function publicText(page: Page): Promise<string> {
  return page.evaluate(() =>
    [
      document.body.innerText,
      ...[...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
      ...[...document.querySelectorAll("meta")].map((m) => m.getAttribute("content") ?? ""),
      ...[...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ""),
      document.title,
    ].join("\n"),
  );
}

/** An Indian mobile number in any common spacing, or a tel: link. Deliberately generic: the repo never holds the number itself. */
export const PHONE_PATTERN = /(?<![\w.])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w.])|tel:/;

import { test } from "@playwright/test";

/**
 * WebGL specs depend on software GL in headless WebKit, which has not been verified on this project yet. Until it is,
 * they are skipped there (set PW_WEBKIT_WEBGL=1 to run them). The DOM specs always run on WebKit.
 */
export function skipWebGLOnWebKit() {
  test.skip(({ browserName }) => browserName === "webkit" && process.env.PW_WEBKIT_WEBGL !== "1", "WebGL on headless WebKit is opt-in (PW_WEBKIT_WEBGL=1)");
}
