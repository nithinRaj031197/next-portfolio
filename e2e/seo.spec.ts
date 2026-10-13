import { expect, test } from "@playwright/test";
import { PHONE_PATTERN, TEST_ORIGIN, TEST_RESUME_URL, publicText } from "./helpers";

const ORIGIN = TEST_ORIGIN;

test.describe("metadata derives from the one configured origin", () => {
  test("canonical, Open Graph, Twitter and icons", async ({ page, request }) => {
    await page.goto("/?quality=none");
    const meta = (selector: string, attribute = "content") => page.locator(selector).first().getAttribute(attribute);

    expect(await page.title()).toBe("Nithin Raj — Frontend Engineer");
    expect(await meta('link[rel="canonical"]', "href")).toBe(ORIGIN);
    expect(await meta('meta[property="og:url"]')).toBe(ORIGIN);
    expect(await meta('meta[property="og:type"]')).toBe("website");
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta('meta[name="description"]')).toMatch(/React\.js, TypeScript and frontend architecture/);
    expect(await page.locator("html").getAttribute("lang")).toBe("en");

    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      const url = (await meta(selector))!;
      expect(url.startsWith(ORIGIN)).toBe(true);
      const image = await request.get(url.replace(ORIGIN, ""));
      expect(image.status()).toBe(200);
      expect(image.headers()["content-type"]).toBe("image/png");
    }
    expect(await meta('meta[property="og:image:width"]')).toBe("1200");
    expect(await meta('meta[property="og:image:height"]')).toBe("630");
    expect(await meta('meta[property="og:image:alt"]')).toMatch(/Frontend Engineer/);
    for (const rel of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) expect((await request.get((await meta(rel, "href"))!)).status()).toBe(200);

    // Nothing in the head points at the old placeholder domain or at a dev origin.
    const head = await page.locator("head").innerHTML();
    expect(head).not.toContain("nithinraj.dev");
    expect(head).not.toContain("localhost:3000");
    if (!ORIGIN.includes("localhost")) expect(head).not.toContain("localhost");
  });

  test("sitemap and robots", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${ORIGIN}/</loc>`);
    expect(sitemap).not.toContain("/lab");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(robots).toMatch(/Disallow:\s*\/lab\//);
  });

  test("the dev-only fish lab is not built, linked, or discoverable in production", async ({ request, page }) => {
    // It lives in page.dev.tsx, which next.config.mjs only compiles for the dev server, so the route does not exist.
    expect((await request.get("/lab/fish")).status()).toBe(404);
    await page.goto("/?quality=none");
    expect(await page.locator('a[href*="/lab"]').count()).toBe(0);
  });
});

test("structured data is valid, factual and free of private details", async ({ page }) => {
  await page.goto("/?quality=none");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks).toHaveLength(1);
  const data = JSON.parse(blocks[0]!);

  expect(data["@context"]).toBe("https://schema.org");
  expect(data["@type"]).toBe("Person");
  expect(data.name).toBe("Nithin Raj");
  expect(data.jobTitle).toBe("Frontend Engineer");
  expect(data.url).toBe(`${ORIGIN}/`);
  expect(data.sameAs).toEqual(["https://github.com/nithinRaj031197", "https://www.linkedin.com/in/nithin-raj-831108214/"]);
  expect(data.address).toMatchObject({ addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" });
  expect(data.knowsAbout).toEqual(expect.arrayContaining(["React.js", "Next.js", "TypeScript", "Design Systems"]));

  // Allow-list: anything not named here (phone, email, telephone, worksFor, birth dates...) must not appear.
  expect(Object.keys(data).sort()).toEqual(["@context", "@type", "address", "jobTitle", "knowsAbout", "name", "sameAs", "url"]);
  expect(blocks[0]).not.toMatch(PHONE_PATTERN);
  expect(blocks[0]).not.toContain("@gmail");
});

test("no phone number anywhere a visitor, crawler or scraper can read", async ({ page, request }) => {
  await page.goto("/?quality=none");
  expect(await publicText(page)).not.toMatch(PHONE_PATTERN);
  for (const path of ["/robots.txt", "/sitemap.xml"]) expect(await (await request.get(path)).text()).not.toMatch(PHONE_PATTERN);
});

test("no résumé file ships with the site, and the link is the configured public URL", async ({ page, request }) => {
  await page.goto("/?quality=none");
  expect((await request.get("/Nithin_Raj_Resume.pdf")).status()).toBe(404);
  const href = await page.locator("#top").getByRole("link", { name: /View Resume/ }).getAttribute("href");
  expect(href).toBe(TEST_RESUME_URL);
});
