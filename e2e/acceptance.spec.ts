import { expect, test, type Page } from "@playwright/test";
import { TEST_RESUME_URL, skipWebGLOnWebKit } from "./helpers";

// Release-candidate acceptance: behaviour a visitor depends on, not implementation detail.
// Specs that don't need WebGL use ?quality=none so software GL cannot starve the main thread.
const PLAIN = "/?quality=none";

const headerBottom = (page: Page) => page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);

test.describe("routes", () => {
  test("an unknown address gets a branded, accessible 404 that leads home", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found.");
    await expect(page.getByRole("main")).toBeVisible();
    expect(await page.title()).toContain("Page not found");
    // Next adds noindex itself; there must be no conflicting duplicate.
    const robots = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute("content")));
    expect(robots.length).toBe(1);
    expect(robots[0]).toMatch(/noindex/);
    // Plain on purpose: no WebGL, no scene.
    await page.waitForTimeout(2500);
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.getByRole("link", { name: "Back to the portfolio" }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
  });

  test("routes and files from earlier portfolio versions and dev tools do not exist", async ({ request }) => {
    for (const path of ["/lab/fish", "/lab", "/projects", "/projects.json", "/Nithin_Raj_Resume.pdf", "/planet/scene.gltf", "/particles-config.json", "/favicon.ico.bak"]) {
      expect((await request.get(path)).status(), path).toBe(404);
    }
  });
});

test.describe("anchors", () => {
  const TARGETS: [hash: string, heading: string][] = [
    ["#about", "#about h2"],
    ["#experience", "#experience h2"],
    ["#projects", "#projects h2"],
    ["#architecture", "#architecture h2"],
    ["#skills", "#skills h2"],
    ["#contact", "#contact h2"],
    ["#project-federation", "#project-federation h3"],
    ["#case-federation", "#case-federation summary"],
    ["#case-ai-console", "#case-ai-console summary"],
  ];

  for (const [hash, heading] of TARGETS) {
    test(`a fresh load at ${hash} lands with the heading below the fixed header`, async ({ page }) => {
      await page.goto(`/?quality=none${hash}`);
      const target = page.locator(heading).first();
      // The page scrolls itself on load (smoothly): wait for it to settle rather than sleep.
      await expect
        .poll(async () => {
          const [top, header] = [await target.evaluate((el) => el.getBoundingClientRect().top), await headerBottom(page)];
          return top >= header - 1 && top < header + 420;
        }, { message: `${hash} heading position`, timeout: 8000 })
        .toBe(true);
    });
  }

  test("navigation after hydration keeps every section heading clear of the header", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop nav; the mobile menu is covered separately");
    await page.goto(PLAIN);
    for (const [link, heading] of [["About", "#about h2"], ["Experience", "#experience h2"], ["Projects", "#projects h2"], ["Architecture", "#architecture h2"], ["Skills", "#skills h2"], ["Contact", "#contact h2"]]) {
      await page.locator("header nav a:visible", { hasText: new RegExp(`^${link}$`) }).click();
      const target = page.locator(heading!);
      await expect.poll(async () => (await target.evaluate((el) => el.getBoundingClientRect().top)) >= (await headerBottom(page)) - 1, { message: link, timeout: 8000 }).toBe(true);
    }
  });
});

test.describe("history", () => {
  test("UI-only actions never add history entries; anchor navigation adds exactly one", async ({ page }) => {
    await page.goto(PLAIN);
    const length = () => page.evaluate(() => history.length);
    const start = await length();

    // Open and close case studies and notes (the URL is replaced, not pushed).
    for (const id of ["case-ai-console", "case-workflow-builder"]) {
      await page.locator(`details#${id} summary`).click();
      await page.locator(`details#${id} summary`).click();
    }
    await page.locator("details#note-virtualization summary").click();
    await page.locator("details#note-virtualization summary").click();
    expect(await length()).toBe(start);

    // The URL of an open case study is shareable but is the *same* history entry.
    await page.locator("details#case-vehicle-ops summary").click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#case-vehicle-ops");
    expect(await length()).toBe(start);
  });

  test("the mobile menu adds no history, and Back returns to the previous anchor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PLAIN);
    const start = await page.evaluate(() => history.length);
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await page.keyboard.press("Escape");
    await menu.click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Skills" }).click();
    // Following a real anchor is the one intentional entry.
    expect(await page.evaluate(() => history.length)).toBe(start + 1);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#skills");
    await page.goBack();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("");
  });

  test("Back after a deep link returns to the page, not to a hidden state", async ({ page }) => {
    await page.goto("/?quality=none#case-federation");
    await expect(page.locator("details#case-federation")).toHaveAttribute("open", "");
    await page.evaluate(() => (location.hash = "#skills"));
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#skills");
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    // Anything in view is visible once its (200 ms-ish) reveal has run: poll rather than sample mid-fade.
    await expect
      .poll(() => page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1" && el.getBoundingClientRect().top < innerHeight).length), { timeout: 4000 })
      .toBe(0);
  });
});

test.describe("links", () => {
  test("every link goes somewhere real and external links belong to the right owner", async ({ page }) => {
    await page.goto(PLAIN);
    const links = await page.locator("a[href]").evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute("href")!, target: el.getAttribute("target"), rel: el.getAttribute("rel") ?? "", text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40) })),
    );
    expect(links.length).toBeGreaterThan(20);

    const resume = new URL(TEST_RESUME_URL);
    const external = new Set<string>();
    for (const link of links) {
      if (link.href.startsWith("#")) {
        const id = decodeURIComponent(link.href.slice(1));
        if (id) expect(await page.locator(`[id="${id}"]`).count(), `anchor ${link.href} (${link.text})`).toBe(1);
      } else if (link.href.startsWith("mailto:")) {
        expect(link.href).toBe("mailto:nithinraj.official3@gmail.com");
      } else {
        const url = new URL(link.href);
        expect(url.protocol, link.href).toBe("https:");
        const owned =
          (url.hostname === "github.com" && url.pathname === "/nithinRaj031197") ||
          (url.hostname === "www.linkedin.com" && url.pathname === "/in/nithin-raj-831108214/") ||
          (url.hostname === resume.hostname && url.pathname === resume.pathname);
        expect(owned, `unexpected external destination: ${link.href}`).toBe(true);
        expect(link.target, link.href).toBe("_blank");
        expect(link.rel, link.href).toContain("noopener");
        expect(link.rel, link.href).toContain("noreferrer");
        external.add(link.href);
      }
    }
    expect([...external].sort()).toEqual([TEST_RESUME_URL, "https://github.com/nithinRaj031197", "https://www.linkedin.com/in/nithin-raj-831108214/"].sort());
  });

  test("a configured résumé URL activates every Resume entry point", async ({ page }) => {
    await page.goto(PLAIN);
    // Header, mobile menu, hero and contact: all four point at the configured URL, and nothing else does.
    expect(await page.locator(`a[href="${TEST_RESUME_URL}"]`).count()).toBe(4);
    expect(await page.locator('a[href$=".pdf"]').count()).toBe(4);
    await expect(page.locator("#top").getByRole("link", { name: /View Resume/ })).toHaveAttribute("href", TEST_RESUME_URL);
    await expect(page.locator("#contact").getByRole("link", { name: /Resume/ })).toHaveAttribute("href", TEST_RESUME_URL);
  });
});

test.describe("enhancement failures cannot take the page down", () => {
  const INTACT = async (page: Page) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
    await expect(page.locator("[data-project]")).toHaveCount(4);
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
    expect(await page.locator("[data-reveal]").evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== "1").length)).toBe(0);
  };

  // Absence is the realistic failure (very old browsers, locked-down webviews). A constructor that throws would break
  // Next's own runtime, which builds an observer at module load, so that case is outside this app's control.
  test("IntersectionObserver missing: content stays visible, navigation and menu still work", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript("delete window.IntersectionObserver;");
    await page.goto(PLAIN);
    await page.waitForTimeout(800);
    await INTACT(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Menu" }).click();
    await page.locator("#mobile-nav").getByRole("link", { name: "Contact" }).click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#contact");
    expect(errors, "no uncaught errors").toEqual([]);
  });
});

test.describe("structure survives without styles or scripts", () => {
  test.use({ javaScriptEnabled: false });

  test("with CSS blocked the reading order is still About → Experience → Projects → Architecture → Skills → Contact", async ({ page }) => {
    await page.route("**/*.css", (route) => route.abort());
    await page.goto(PLAIN);
    const levels = await page.locator("h1, h2").evaluateAll((els) => els.map((el) => `${el.tagName.toLowerCase()}:${(el.textContent ?? "").trim().slice(0, 18)}`));
    expect(levels[0]).toMatch(/^h1:Nithin Raj/);
    expect(levels.length).toBe(7);
    const text = await page.locator("main").innerText();
    const order = ["01 / PROFILE", "02 / EXPERIENCE", "03 / PROJECTS", "04 / ARCHITECTURE", "05 / SKILLS", "06 / CONTACT"].map((label) => text.toUpperCase().indexOf(label));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test("without JavaScript a visitor can read everything and reach every section", async ({ page }) => {
    await page.goto(PLAIN);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
    for (const id of ["about", "experience", "projects", "architecture", "skills", "contact"]) await expect(page.locator(`#${id}`)).toBeVisible();
    // Native <details> expands without JS, and its content is real text.
    await page.locator("details#case-vehicle-ops summary").click();
    await expect(page.locator("details#case-vehicle-ops")).toContainText("HMAC");
    // Navigation: the no-JS menu fallback and in-page anchors both work.
    await page.locator("header a[href='#contact']:visible").first().click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#contact");
    await expect(page.getByRole("link", { name: /nithinraj\.official3@gmail\.com/ })).toHaveAttribute("href", /^mailto:/);
  });
});

test.describe("touch targets and keyboard", () => {
  test("primary mobile controls are at least 44px", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile project only");
    await page.goto(PLAIN);
    const size = async (locator: ReturnType<Page["locator"]>) => (await locator.first().boundingBox())!;
    const menu = await size(page.getByRole("button", { name: "Menu" }));
    expect(menu.height).toBeGreaterThanOrEqual(43.5);
    expect(menu.width).toBeGreaterThanOrEqual(43.5);
    for (const name of [/View Projects/, /View Resume/, /Contact Me/]) expect((await size(page.locator("#top").getByRole("link", { name }))).height, String(name)).toBeGreaterThanOrEqual(43.5);
    expect((await size(page.locator("details#case-ai-console summary"))).height).toBeGreaterThanOrEqual(43.5);
    expect((await size(page.locator("details#note-virtualization summary"))).height).toBeGreaterThanOrEqual(43.5);
    for (const link of await page.locator('#contact ul[aria-label="Contact links"] a').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
    await page.getByRole("button", { name: "Menu" }).click();
    for (const link of await page.locator("#mobile-nav a").all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
  });

  test("tab order follows the document and expanding a <details> adds no stops", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop traversal");
    await page.goto(PLAIN);
    expect(await page.locator("[tabindex]:not([tabindex='-1']):not([tabindex='0'])").count(), "no positive tabindex").toBe(0);

    const stops = async () => {
      const order: string[] = [];
      // Tab exactly once per focusable element: one more would wrap to the start of the page, which is not "backwards".
      const count = await page.evaluate(
        () => [...document.querySelectorAll('a[href], button, summary')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[hidden]") && !el.closest("noscript"); }).length,
      );
      for (let i = 0; i < count; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          if (!el || el === document.body) return null;
          (window as unknown as { __seq: Element[] }).__seq ??= [];
          const seq = (window as unknown as { __seq: Element[] }).__seq;
          const inOrder = seq.length === 0 || !!(seq[seq.length - 1]!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
          seq.push(el);
          return { label: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30), inOrder };
        });
        if (!info) break;
        expect(info.inOrder, `focus moved backwards at "${info.label}"`).toBe(true);
        order.push(info.label);
      }
      await page.evaluate(() => ((window as unknown as { __seq: Element[] }).__seq = []));
      return order;
    };

    const before = await stops();
    await page.reload();
    await page.locator("details").evaluateAll((els) => els.forEach((e) => ((e as HTMLDetailsElement).open = true)));
    const after = await stops();
    expect(after.length).toBe(before.length);
    expect(before.length).toBeGreaterThan(25);
  });

  test("after choosing a mobile-menu link, the next Tab continues inside that section", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(PLAIN);
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.focus();
    await page.keyboard.press("Enter");
    await page.locator("#mobile-nav").getByRole("link", { name: "Projects" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#projects");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("#projects"))).toBe(true);
  });
});

test.describe("quality tiers", () => {
  skipWebGLOnWebKit();

  for (const [tier, canvases] of [["high", 1], ["medium", 1], ["low", 1], ["none", 0]] as const) {
    test(`?quality=${tier} renders the complete page${canvases ? " with one scene" : " with no canvas"}`, async ({ page }) => {
      await page.goto(`/?quality=${tier}`);
      if (canvases) await expect(page.locator("[data-scene]")).toHaveAttribute("data-quality", tier, { timeout: 25_000 });
      else await page.waitForTimeout(3500);
      await expect(page.locator("canvas")).toHaveCount(canvases);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
      await expect(page.locator("[data-project]")).toHaveCount(4);
      await expect(page.getByRole("link", { name: "View Projects" })).toBeVisible();
    });
  }

  test("automatic step-down only ever goes down, never duplicates the canvas, and keeps the page intact", async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/"); // no override: the governor is free to step down
    const rank = { high: 3, medium: 2, low: 1 } as Record<string, number>;
    const seen: number[] = [];
    let maxCanvases = 0;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const state = await page.evaluate(() => ({ tier: document.querySelector("[data-scene]")?.getAttribute("data-quality") ?? null, canvases: document.querySelectorAll("canvas").length }));
      maxCanvases = Math.max(maxCanvases, state.canvases);
      if (state.tier) seen.push(rank[state.tier]!);
    }
    expect(maxCanvases).toBeLessThanOrEqual(1);
    for (let i = 1; i < seen.length; i++) expect(seen[i]!, `tier went up at sample ${i}`).toBeLessThanOrEqual(seen[i - 1]!);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nithin Raj");
    expect(errors, "no uncaught errors during step-down").toEqual([]);
  });
});
