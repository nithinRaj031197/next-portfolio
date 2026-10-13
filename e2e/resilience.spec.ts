import { expect, test, type Page } from "@playwright/test";
import { TEST_RESUME_URL, skipWebGLOnWebKit } from "./helpers";

/** The page is "intact" when the content a visitor came for is readable and nothing else has taken over the screen. */
async function expectPageIntact(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
  await expect(page.getByRole("link", { name: "View Projects" })).toBeVisible();
  await expect(page.locator("[data-project]")).toHaveCount(4);
}

const RAF_COUNTER = () => {
  const w = window as unknown as { __raf: number };
  w.__raf = 0;
  const original = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => {
    w.__raf++;
    return original(cb);
  };
};

test.describe("failure modes keep the HTML page usable", () => {
  skipWebGLOnWebKit();

  test("WebGL initialisation throwing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Force the scene to be attempted (the override skips detection), but make every WebGL context request fail.
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/.test(type)) return null;
        return (original as (...args: unknown[]) => unknown).call(this, type, ...rest) as ReturnType<typeof original>;
      } as typeof original;
    });
    await page.goto("/?quality=high");
    await page.waitForTimeout(4000);
    await expectPageIntact(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(errors, "no uncaught page errors").toEqual([]);
  });

  test("the lazy WebGL chunk failing to load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let pageLoaded = false;
    // After load, every further script chunk (which includes the WebGL one) fails, as on a dropped connection.
    await page.route("**/_next/static/chunks/**", (route) => (pageLoaded ? route.abort() : route.continue()));
    await page.goto("/?quality=low", { waitUntil: "load" });
    pageLoaded = true;
    await page.waitForTimeout(4500);
    await expectPageIntact(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(errors, "no uncaught page errors").toEqual([]);
  });

  test("a lost WebGL context drops the canvas, frees its listeners and stops rendering", async ({ page }) => {
    // Net count of window scroll/pointermove listeners: whatever the scene adds must be removed when it goes.
    await page.addInitScript(() => {
      const w = window as unknown as { __net: Record<string, number>; __raf: number };
      w.__net = { scroll: 0, pointermove: 0 };
      const add = window.addEventListener.bind(window);
      const remove = window.removeEventListener.bind(window);
      window.addEventListener = ((type: string, ...rest: unknown[]) => {
        if (type in w.__net) w.__net[type]!++;
        return (add as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof window.addEventListener;
      window.removeEventListener = ((type: string, ...rest: unknown[]) => {
        if (type in w.__net) w.__net[type]!--;
        return (remove as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof window.removeEventListener;
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/?quality=medium");
    const before = await page.evaluate(() => ({ ...(window as unknown as { __net: Record<string, number> }).__net }));
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 20_000 });
    const during = await page.evaluate(() => ({ ...(window as unknown as { __net: Record<string, number> }).__net }));
    expect(during.scroll).toBeGreaterThan(before.scroll!);

    await page.locator("canvas").evaluate((canvas) => {
      const gl = (canvas as HTMLCanvasElement).getContext("webgl2") ?? (canvas as HTMLCanvasElement).getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    await expect(page.locator("canvas")).toHaveCount(0, { timeout: 10_000 });
    await expectPageIntact(page);

    const after = await page.evaluate(() => ({ ...(window as unknown as { __net: Record<string, number> }).__net }));
    expect(after.scroll, "scroll listeners released").toBe(before.scroll);
    expect(after.pointermove, "pointer listeners released").toBe(before.pointermove);

    // No render loop left running in the background.
    await page.evaluate(RAF_COUNTER);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as unknown as { __raf: number }).__raf)).toBeLessThan(5);
    expect(errors, "no uncaught page errors").toEqual([]);
  });
});

test.describe("slow fonts", () => {
  test("the hero text is readable immediately on a fallback font, and the swap barely moves the layout", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!entry.hadRecentInput) w.__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    // Fonts arrive three seconds late.
    await page.route("**/*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });
    await page.goto("/?quality=none", { waitUntil: "domcontentloaded" });

    // Visible and sized while the fonts are still loading.
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.fonts.status)).toBe("loading");
    const box = (await heading.boundingBox())!;
    expect(box.height).toBeGreaterThan(40);

    await page.waitForTimeout(5000);
    expect(await page.evaluate(() => document.fonts.status)).toBe("loaded");
    // next/font's size-matched fallback keeps the swap small; the budget is well under "needs improvement" (0.1).
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.05);
  });
});

test("an unreachable resume URL or social link does not affect the page", async ({ page }) => {
  await page.route(`${new URL(TEST_RESUME_URL).origin}/**`, (route) => route.abort());
  await page.route("https://github.com/**", (route) => route.abort());
  await page.goto("/?quality=none");
  await expectPageIntact(page);
  const resume = page.locator("#top").getByRole("link", { name: /View Resume/ });
  await expect(resume).toBeVisible();
  // Links are plain anchors that open in a new tab: nothing in the page depends on the target responding.
  await expect(resume).toHaveAttribute("rel", /noopener/);
});
