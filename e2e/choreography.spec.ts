import { expect, test, type Page } from "@playwright/test";
import { skipWebGLOnWebKit } from "./helpers";

skipWebGLOnWebKit();

/** Wraps layout-reading APIs so tests can assert the render/scroll path does not touch the DOM for geometry. */
async function installLayoutReadCounter(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __reads: number; __scrollListeners: number };
    w.__reads = 0;
    w.__scrollListeners = 0;
    const rect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      w.__reads++;
      return rect.call(this);
    };
    const add = window.addEventListener.bind(window);
    window.addEventListener = ((type: string, ...rest: unknown[]) => {
      if (type === "scroll") w.__scrollListeners++;
      return (add as (...args: unknown[]) => void)(type, ...rest);
    }) as typeof window.addEventListener;
  });
}

const scrollListeners = (page: Page) => page.evaluate(() => (window as unknown as { __scrollListeners: number }).__scrollListeners);

test.describe("scroll choreography", () => {
  test("scrolling reads no layout and keeps native scrolling", async ({ page }) => {
    await installLayoutReadCounter(page);
    await page.goto("/?quality=low");
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    await page.waitForTimeout(800);
    const before = await page.evaluate(() => (window as unknown as { __reads: number }).__reads);

    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => (window as unknown as { __reads: number }).__reads);
    expect(after - before).toBe(0);
    // Native scrolling: the wheel actually moved the page, and nothing locked it.
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(3000);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  });

  test("reduced motion registers no scroll tracking, full motion does", async ({ browser }) => {
    const results: Record<string, number> = {};
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await installLayoutReadCounter(page);
      await page.goto("/?quality=low");
      await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", reducedMotion === "reduce" ? "reduced" : "full", { timeout: 20_000 });
      results[reducedMotion] = await scrollListeners(page);
      await context.close();
    }
    expect(results["no-preference"]).toBeGreaterThan(results["reduce"]!);
  });

  test("nav anchors land with the section heading in view, below the fixed header", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop nav; the mobile menu has its own tests");
    await page.goto("/?quality=none");
    for (const id of ["about", "experience", "projects", "architecture", "skills", "contact"]) {
      await page.locator(`header a[href="#${id}"]`).first().click();
      // html has scroll-behavior: smooth, so wait for the animation to settle instead of sleeping.
      const top = () => page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      await expect.poll(top, { message: id, timeout: 6000 }).toBeLessThan(120);
      expect(await top(), id).toBeGreaterThanOrEqual(-4);
    }
  });

  test("draws a handful of calls per frame, not dozens", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __draws: number };
      w.__draws = 0;
      for (const proto of [WebGL2RenderingContext.prototype, WebGLRenderingContext.prototype]) {
        const target = proto as unknown as Record<string, (...args: unknown[]) => void>;
        for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"]) {
          const original = target[name];
          if (!original) continue;
          target[name] = function (this: unknown, ...args: unknown[]) {
            w.__draws++;
            return original.apply(this, args);
          };
        }
      }
    });
    await page.goto("/?quality=high");
    await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    await page.waitForTimeout(1000);
    await page.evaluate(() => ((window as unknown as { __draws: number }).__draws = 0));
    const frames = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let count = 0;
          const tick = () => (++count >= 30 ? resolve(count) : requestAnimationFrame(tick));
          requestAnimationFrame(tick);
        }),
    );
    const draws = await page.evaluate(() => (window as unknown as { __draws: number }).__draws);
    expect(draws / frames).toBeLessThanOrEqual(12);
  });

});

test("scrolling through every section causes no per-frame React work", async ({ page }) => {
  // React reports each commit to the devtools hook if one is present; count them without installing devtools.
  await page.addInitScript(() => {
    const w = window as unknown as { __commits: number };
    w.__commits = 0;
    (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: false,
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE() {},
      onCommitFiberRoot: () => w.__commits++,
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
    };
  });
  await page.goto("/?quality=low");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
  await page.waitForTimeout(1000);
  const before = await page.evaluate(() => (window as unknown as { __commits: number }).__commits);
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(50);
  }
  const commits = (await page.evaluate(() => (window as unknown as { __commits: number }).__commits)) - before;
  // Only the nav's active-section indicator may commit (a handful of section changes), not once per scroll event or frame.
  expect(commits).toBeLessThan(25);
});
