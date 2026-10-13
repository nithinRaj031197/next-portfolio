import { expect, test } from "@playwright/test";
import { skipWebGLOnWebKit } from "./helpers";

// Tests that are not about WebGL skip the scene: headless Chrome has no GPU, and software GL saturates the main thread.
const PLAIN = "/?quality=none";

test("skip link is first in tab order and moves focus to main", async ({ page }) => {
  await page.goto(PLAIN);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("nav links are keyboard reachable and mark the active section", async ({ page, isMobile }) => {
  test.skip(isMobile, "tab traversal is covered on desktop");
  await page.goto(PLAIN);
  await page.getByRole("link", { name: "Projects", exact: true }).first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#projects")).toBeInViewport();
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "location");
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("opens, exposes aria state, closes on Escape and returns focus", async ({ page }) => {
    await page.goto(PLAIN);
    const button = page.getByRole("button", { name: "Menu" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toHaveAttribute("aria-controls", "mobile-nav");
    await expect(page.locator("#mobile-nav")).toBeHidden();

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("closes after navigating and reaches the section", async ({ page }) => {
    await page.goto(PLAIN);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Projects" }).click();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test("is keyboard operable and keeps Resume in the menu without overflow", async ({ page }) => {
    await page.goto(PLAIN);
    await page.getByRole("button", { name: "Menu" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mobile-nav").getByRole("link", { name: "Resume" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("WebGL layer", () => {
  skipWebGLOnWebKit();

  test("initial JavaScript does not include three.js", async ({ page, request }) => {
    const response = await request.get("/");
    const html = await response.text();
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]!);
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts) {
      const body = await (await request.get(src)).text();
      expect(body, src).not.toContain("WebGLRenderer");
    }
    void page;
  });

  test("mounts one decorative canvas after load, hidden from assistive tech and inert", async ({ page }) => {
    await page.goto("/?quality=low");
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveCount(1, { timeout: 20_000 });
    await expect(scene).toHaveAttribute("aria-hidden", "true");
    await expect(scene).toHaveAttribute("data-quality", "low");
    await expect(page.locator("canvas")).toHaveCount(1);
    expect(await scene.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  });

  /** Counts requestAnimationFrame calls over a window: the render loop is the only steady caller on this page. */
  async function frameCallsPerSecond(page: import("@playwright/test").Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __raf: number };
      w.__raf = 0;
      const original = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => {
        w.__raf++;
        return original(cb);
      };
    });
    await page.waitForTimeout(1000);
    return page.evaluate(() => (window as unknown as { __raf: number }).__raf);
  }

  test("full motion keeps a running render loop (control for the reduced-motion test)", async ({ page }) => {
    await page.goto("/?quality=low");
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    // Software GL under parallel workers can be slow, so only require a clearly running loop (idle is < 5).
    expect(await frameCallsPerSecond(page)).toBeGreaterThan(8);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("renders a static scene: no continuous render loop, even while scrolling", async ({ page }) => {
      await page.goto("/?quality=high");
      await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", "reduced", { timeout: 20_000 });
      await expect(page.locator("canvas")).toHaveCount(1);
      await page.waitForTimeout(500);
      const idle = await frameCallsPerSecond(page);
      await page.mouse.wheel(0, 1200);
      const scrolling = await frameCallsPerSecond(page);
      expect(idle).toBeLessThan(5);
      expect(scrolling).toBeLessThan(10);
    });
  });
});

test.describe("mobile menu on short viewports (landscape phones)", () => {
  for (const [width, height] of [[844, 390], [667, 375]] as const) {
    test(`${width}x${height}: every item stays reachable by scrolling the panel`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(PLAIN);
      await page.getByRole("button", { name: "Menu" }).click();
      const panel = page.locator("#mobile-nav");
      // The panel never extends past the viewport, and scrolls internally when it is taller than the space it has.
      const fit = await panel.evaluate((el) => ({ bottom: el.getBoundingClientRect().bottom, vh: innerHeight, scrolls: el.scrollHeight > el.clientHeight }));
      expect(fit.bottom).toBeLessThanOrEqual(fit.vh + 1);
      expect(fit.scrolls).toBe(true);
      const last = panel.getByRole("link", { name: "Resume" });
      await last.scrollIntoViewIfNeeded();
      await expect(last).toBeInViewport();
      await last.focus();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    });
  }
});

test("desktop Resume button is not shown beside the mobile menu button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PLAIN);
  const header = page.locator("header").first();
  await expect(header.getByRole("button", { name: "Menu" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Resume" })).toBeHidden();
});
