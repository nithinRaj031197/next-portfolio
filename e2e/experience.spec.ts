import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Not about WebGL: skip the scene so software GL cannot starve the main thread.
const PLAIN = "/?quality=none";
const WIDTHS = [1440, 1280, 1024, 768, 430, 390, 360, 320];

test.describe("scroll reveals: content never waits", () => {
  test("an anchor jump reveals its section promptly", async ({ page }) => {
    await page.goto(PLAIN);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.location.hash = "#skills";
    });
    // The reveal is delivered with a rendering frame, so a freshly launched software-GL browser can take a couple of
    // seconds for its first frames (in a normal browser it is ~20 ms). What matters is that it happens on its own,
    // with no further scrolling, so assert that rather than a tight latency.
    await expect(page.locator("#skills header[data-reveal]")).toHaveAttribute("data-revealed", "", { timeout: 8000 });
  });

  test("returning with the back button never leaves content hidden", async ({ page }) => {
    await page.goto(PLAIN);
    await page.evaluate(() => window.scrollTo({ top: 4200, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(4000);
    await page.goto("/robots.txt");
    await page.goBack();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    // Everything in view or above it is visible straight away.
    await expect
      .poll(() => page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => el.getBoundingClientRect().top < innerHeight && getComputedStyle(el).opacity !== "1").length))
      .toBe(0);
  });

  test("scrolling at reading speed reveals each block within a moment of it arriving", async ({ page }) => {
    await page.goto(PLAIN);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    const target = page.locator("#experience article").first();
    await page.evaluate(() => {
      const el = document.querySelector("#experience article")!;
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.6, behavior: "instant" });
    });
    // Arrives by its own: no further scrolling is needed (same frame-delivery caveat as above).
    await expect(target).toHaveAttribute("data-revealed", "", { timeout: 8000 });
  });
});

test.describe("scroll reveals", () => {
  test("hide only what is below the fold, and reveal it on arrival", async ({ page }) => {
    await page.goto(PLAIN);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    const target = page.locator('[data-project="federation"]');
    // Below the fold: switched on but not yet revealed.
    await expect(target).not.toHaveAttribute("data-revealed", "");
    expect(await target.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    // Everything already on screen was revealed without waiting.
    await expect(page.locator("#about header[data-reveal]")).not.toHaveAttribute("data-revealed", "");
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveAttribute("data-revealed", "");
    await expect.poll(() => target.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("a fast jump to the bottom never leaves content hidden behind it", async ({ page }) => {
    await page.goto(PLAIN);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "on");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
    // Sections above the viewport must already be visible.
    await expect.poll(() => page.locator("[data-reveal]:not([data-revealed])").evaluateAll((els) => els.filter((el) => el.getBoundingClientRect().bottom < 0).length)).toBe(0);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows everything immediately and never switches the reveal state on", async ({ page }) => {
      await page.goto(PLAIN);
      await page.waitForTimeout(800);
      await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
      const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
      expect(hidden).toBe(0);
    });

    test("does not move the primary CTA toward the pointer", async ({ page }) => {
      await page.goto(PLAIN);
      const cta = page.getByRole("link", { name: "View Projects" });
      const box = (await cta.boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.9);
      await page.waitForTimeout(150);
      expect(await cta.evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
    });
  });
});

test("the primary CTA leans a few pixels toward a fine pointer, and no further", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch devices have no magnetic effect (checked below)");
  await page.goto(PLAIN);
  const cta = page.getByRole("link", { name: "View Projects" });
  const box = (await cta.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height * 0.9);
  await expect.poll(() => cta.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe("");
  const [dx, dy] = (await cta.evaluate((el) => (el as HTMLElement).style.transform)).match(/-?\d+(\.\d+)?/g)!.map(Number);
  expect(Math.hypot(dx!, dy!)).toBeLessThanOrEqual(6);
  await page.mouse.move(5, 5);
  await expect.poll(() => cta.evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
});

test("touch devices get no magnetic movement", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto(PLAIN);
  const cta = page.getByRole("link", { name: "View Projects" });
  await page.waitForTimeout(500);
  expect(await cta.evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("everything is visible and usable", async ({ page }) => {
    await page.goto(PLAIN);
    const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length);
    expect(hidden).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
    await expect(page.getByRole("link", { name: "View Projects" })).toHaveAttribute("href", "#projects");
    await expect(page.getByRole("link", { name: /Contact Me/ })).toHaveAttribute("href", "#contact");
    await expect(page.locator("[data-project]")).toHaveCount(4);
    await expect(page.locator("#architecture details")).toHaveCount(6);
    await expect(page.getByRole("link", { name: /nithinraj\.official3@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
    // Native <details> still opens without JS.
    await page.locator('details#case-federation summary').click();
    await expect(page.locator("details#case-federation")).toHaveAttribute("open", "");
  });
});

test.describe("case studies", () => {
  test("open inline with the keyboard, group their content, and keep the URL shareable", async ({ page }) => {
    await page.goto(PLAIN);
    const details = page.locator("details#case-ai-console");
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect.poll(() => new URL(page.url()).hash).toBe("#case-ai-console");
    await expect(details.locator("h4")).toHaveText(["Engineering approach", "Architecture", "Key challenges"]);
    await expect(page.locator("details#case-ai-console summary")).toBeFocused();
    expect(new URL(page.url()).hash).toBe("#case-ai-console");
    await page.keyboard.press("Space");
    await expect(details).not.toHaveAttribute("open", "");
    // The details `toggle` event is asynchronous, so the URL catches up a moment later.
    await expect.poll(() => new URL(page.url()).hash).toBe("");
  });

  test("a deep link opens the case study and scrolls to it", async ({ page }) => {
    await page.goto("/?quality=none#case-federation");
    await expect(page.locator("details#case-federation")).toHaveAttribute("open", "");
    await expect.poll(() => page.locator("details#case-federation").evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(200);
  });

  test("only uses headings it has evidence for (no padded Outcome/Tradeoff sections)", async ({ page }) => {
    await page.goto(PLAIN);
    const headings = await page.locator("details[data-case-study] h4").allTextContents();
    expect(headings.every((heading) => ["Engineering approach", "Architecture", "Key challenges", "Quality", "Scope"].includes(heading))).toBe(true);
    expect(headings).not.toContain("Outcome");
  });
});

test.describe("architecture notes", () => {
  test("reveal why it matters, the trade-off and where it was applied", async ({ page }) => {
    await page.goto(PLAIN);
    const note = page.locator("details#note-virtualization");
    await note.locator("summary").click();
    await expect(note.locator("dt")).toHaveText(["Why it matters", "Trade-off", "Where I applied it"]);
    // Opening one note does not stretch its neighbour.
    const neighbour = await page.locator("details#note-event-driven").evaluate((el) => el.getBoundingClientRect().height);
    expect(neighbour).toBeLessThan(160);
  });
});

test("heading outline has exactly one h1 and never skips a level", async ({ page }) => {
  await page.goto(PLAIN);
  await page.locator("details[data-case-study]").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
  const levels = await page.locator("h1,h2,h3,h4,h5,h6").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
  expect(levels.filter((level) => level === 1)).toHaveLength(1);
  levels.slice(1).forEach((level, i) => expect(level - levels[i]!, `heading #${i + 2}`).toBeLessThanOrEqual(1));
});

test("hero CTAs and section anchors point where they say", async ({ page }) => {
  await page.goto(PLAIN);
  const targets = await page.locator("#top a[href^='#']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  expect(targets).toEqual(["#projects", "#contact"]);
  for (const hash of ["#about", "#experience", "#projects", "#architecture", "#skills", "#contact"]) {
    await expect(page.locator(hash)).toHaveCount(1);
  }
  const resume = page.locator("#top").getByRole("link", { name: /View Resume/ });
  await expect(resume).toHaveAttribute("href", /\.pdf$/);
  await expect(resume).toHaveAttribute("target", "_blank");
});

test.describe("responsive", () => {
  for (const width of WIDTHS) {
    test(`${width}px: no horizontal overflow, even with every case study open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(PLAIN);
      await page.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      // Nothing is wider than the viewport, either (catches clipped overflow).
      const wide = await page.evaluate(() => [...document.querySelectorAll("main *")].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1).length);
      expect(wide).toBe(0);
    });
  }
});

test.describe("accessibility (automated, not a full review)", () => {
  for (const [name, size] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]] as const) {
    test(`axe finds no violations on ${name}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto(PLAIN);
      await page.locator("details").evaluateAll((els) => els.forEach((el) => ((el as HTMLDetailsElement).open = true)));
      await page.waitForTimeout(600);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
});
