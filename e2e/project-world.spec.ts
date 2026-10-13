import { expect, test, type Page } from "@playwright/test";
import { skipWebGLOnWebKit } from "./helpers";

skipWebGLOnWebKit();

const IDS = ["ai-console", "workflow-builder", "vehicle-ops", "federation"];
const SCENE = "[data-scene]";

/** Scrolls so the given project article's centre sits on the scene's reading line (35% of the viewport). */
async function focusProject(page: Page, id: string) {
  await page.evaluate((id) => {
    const rect = document.querySelector(`[data-project="${id}"]`)!.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight * 0.35, behavior: "instant" });
  }, id);
}

const attr = (page: Page, name: string) => page.locator(SCENE).evaluate((el, name) => (el as HTMLElement).dataset[name] ?? "", name);

test.describe("project world", () => {
  test("follows the HTML project in view, and only inside Projects", async ({ page }) => {
    await page.goto("/?quality=low");
    await expect(page.locator(SCENE)).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    // data-gallery is written on the first rendered frame, which can land just after data-motion appears.
    await expect.poll(() => attr(page, "gallery"), { timeout: 20_000 }).toBe("0.0");

    for (const id of IDS) {
      await focusProject(page, id);
      await expect.poll(() => attr(page, "activeProject"), { message: id, timeout: 20_000 }).toBe(id);
      await expect.poll(() => attr(page, "gallery"), { timeout: 20_000 }).toBe("1.0");
    }

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect.poll(() => attr(page, "gallery"), { timeout: 20_000 }).toBe("0.0");
    expect(await attr(page, "activeProject")).toBe("");
  });

  test("hands over between projects in order without flicker", async ({ page }) => {
    await page.goto("/?quality=low");
    await expect(page.locator(SCENE)).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    await page.evaluate(() => {
      const w = window as unknown as { __seen: string[] };
      w.__seen = [];
      const scene = document.querySelector("[data-scene]") as HTMLElement;
      new MutationObserver(() => w.__seen.push(scene.dataset.activeProject ?? "")).observe(scene, { attributes: true, attributeFilter: ["data-active-project"] });
    });
    // Scroll slowly through the whole Projects section in small steps, like a reader would.
    const range = await page.evaluate(() => {
      const first = document.querySelector('[data-project="ai-console"]')!.getBoundingClientRect();
      const last = document.querySelector('[data-project="federation"]')!.getBoundingClientRect();
      return { from: first.top + scrollY - 200, to: last.bottom + scrollY };
    });
    for (let y = range.from; y < range.to; y += 60) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(1500);
    const seen = (await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen)).filter(Boolean);
    expect(seen).toEqual(IDS);
  });

  test("never needs the canvas: HTML controls still work and the canvas takes no pointer events", async ({ page }) => {
    await page.goto("/?quality=low");
    await expect(page.locator(SCENE)).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
    await focusProject(page, "workflow-builder");
    await expect.poll(() => attr(page, "activeProject"), { timeout: 20_000 }).toBe("workflow-builder");
    const summary = page.locator('[data-project="workflow-builder"] summary');
    await summary.click();
    await expect(page.locator('[data-project="workflow-builder"] details')).toHaveAttribute("open", "");
    const topmost = await page.evaluate(() => document.elementFromPoint(window.innerWidth * 0.7, window.innerHeight * 0.5)?.tagName);
    expect(topmost).not.toBe("CANVAS");
    expect(await page.locator("canvas").evaluate((c) => getComputedStyle(c.closest("[data-scene]")!).pointerEvents)).toBe("none");
  });

  test("keeps the semantic project content: four articles with diagrams, in order", async ({ page }) => {
    await page.goto("/?quality=low");
    const articles = page.locator("[data-project]");
    await expect(articles).toHaveCount(4);
    expect(await articles.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.project))).toEqual(IDS);
    for (const id of IDS) await expect(page.locator(`[data-project="${id}"] figure ol li`).first()).toBeVisible();
  });

  test("low quality keeps the draw count small inside Projects", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __frames: number[] };
      w.__frames = [];
      let current = 0;
      const proto = WebGL2RenderingContext.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
      const clear = proto.clear!;
      proto.clear = function (this: unknown, ...args: unknown[]) {
        w.__frames.push(current);
        current = 0;
        return clear.apply(this, args);
      };
      for (const name of ["drawArrays", "drawElements"]) {
        const original = proto[name]!;
        proto[name] = function (this: unknown, ...args: unknown[]) {
          current++;
          return original.apply(this, args);
        };
      }
    });
    await page.goto("/?quality=low");
    await expect(page.locator(SCENE)).toHaveAttribute("data-quality", "low", { timeout: 20_000 });
    await focusProject(page, "ai-console");
    await expect.poll(() => attr(page, "gallery"), { timeout: 20_000 }).toBe("1.0");
    await page.evaluate(() => ((window as unknown as { __frames: number[] }).__frames.length = 0));
    await page.waitForTimeout(2500);
    const frames = (await page.evaluate(() => (window as unknown as { __frames: number[] }).__frames)).slice(1).sort((a, b) => a - b);
    expect(frames.length).toBeGreaterThan(3);
    // fish + particles + panel borders + diagram lines + nodes. No fill, no pulses, no shafts.
    expect(frames[Math.floor(frames.length / 2)]).toBeLessThanOrEqual(5);
  });

  test("quality=none renders no canvas and the Projects HTML is complete", async ({ page }) => {
    await page.goto("/?quality=none");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await focusProject(page, "federation");
    await expect(page.locator('[data-project="federation"] h3')).toBeVisible();
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows one static, understated gallery that ignores scrolling", async ({ page }) => {
      await page.goto("/?quality=medium");
      await expect(page.locator(SCENE)).toHaveAttribute("data-motion", "reduced", { timeout: 20_000 });
      await expect.poll(async () => Number(await attr(page, "gallery")), { timeout: 20_000 }).toBeGreaterThan(0.5);
      const before = await attr(page, "gallery");
      expect(await attr(page, "activeProject")).toBe("");
      for (const id of IDS) {
        await focusProject(page, id);
        await page.waitForTimeout(250);
        expect(await attr(page, "gallery")).toBe(before);
        expect(await attr(page, "activeProject")).toBe("");
      }
    });
  });

  test.describe("small screens", () => {
    for (const width of [320, 390]) {
      test(`${width}px: no horizontal overflow through Projects, and the world stays quiet`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto("/?quality=low");
        await expect(page.locator(SCENE)).toHaveAttribute("data-quality", "low", { timeout: 20_000 });
        for (const id of IDS) {
          await focusProject(page, id);
          await page.waitForTimeout(150);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, id).toBeLessThanOrEqual(0);
        }
        await expect.poll(() => attr(page, "activeProject"), { timeout: 20_000 }).toBe("federation");
      });
    }
  });

  test.describe("tablet composition", () => {
    // Renders only the canvas (HTML hidden) and measures how much panel light lands inside the copy's actual line boxes.
    // HTML readability wins: the 3D layer must stay out of the text at the sizes where the copy runs full width.
    for (const [width, height] of [[768, 1024], [834, 1112]] as const) {
      test(`${width}x${height}: the panel stays clear of the longest bullet lines`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/?quality=medium");
        await expect(page.locator(SCENE)).toHaveAttribute("data-motion", "full", { timeout: 20_000 });
        await focusProject(page, "ai-console");
        await expect.poll(() => attr(page, "activeProject"), { timeout: 20_000 }).toBe("ai-console");
        await page.waitForTimeout(6000); // let the camera and panel settle

        const rects = await page.evaluate(() => {
          const article = document.querySelector('[data-project="ai-console"]')!;
          const out: number[][] = [];
          for (const el of article.querySelectorAll("h3, header p, ul.list-disc li, p.max-w-2xl")) {
            const range = document.createRange();
            range.selectNodeContents(el);
            for (const q of range.getClientRects()) if (q.width > 4 && q.height > 4 && q.bottom > 0 && q.top < innerHeight) out.push([q.left, q.top, q.right, q.bottom]);
          }
          return out;
        });
        expect(rects.length).toBeGreaterThan(5);

        await page.addStyleTag({ content: "main,header,footer{visibility:hidden!important}" });
        const png = (await page.screenshot()).toString("base64");
        const stats = await page.evaluate(
          async ([png, rects]) => {
            const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const g = canvas.getContext("2d")!;
            g.drawImage(bitmap, 0, 0);
            let total = 0;
            let bright = 0;
            for (const [l, t, r, b] of rects as number[][]) {
              const x0 = Math.max(0, Math.floor(l!));
              const y0 = Math.max(0, Math.floor(t!));
              const x1 = Math.min(bitmap.width, Math.ceil(r!));
              const y1 = Math.min(bitmap.height, Math.ceil(b!));
              if (x1 <= x0 || y1 <= y0) continue;
              const data = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
              for (let i = 0; i < data.length; i += 4) {
                total++;
                if (0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]! > 40) bright++; // background is ~10-30
              }
            }
            return { total, brightPercent: (100 * bright) / total };
          },
          [png, rects] as const,
        );
        expect(stats.total).toBeGreaterThan(10_000);
        expect(stats.brightPercent, `${width}px: share of text pixels with panel light`).toBeLessThan(0.5);
      });
    }
  });
});
