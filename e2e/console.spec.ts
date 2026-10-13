import { expect, test } from "@playwright/test";
import { skipWebGLOnWebKit } from "./helpers";

skipWebGLOnWebKit();

// Software-GL drivers print their own performance notes ("GL Driver Message ..."). Those come from the browser's GL
// backend in headless mode, not from the app, so they are the only messages ignored here.
const DRIVER_NOISE = /GL Driver Message/;

for (const [label, query] of [["WebGL scene (low tier)", "?quality=low"], ["no WebGL", "?quality=none"]] as const) {
  test(`production console is clean: ${label}`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()) && !DRIVER_NOISE.test(message.text())) problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => problems.push(`request failed: ${request.url()}`));
    page.on("response", (response) => {
      if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
    });

    await page.goto(`/${query}`, { waitUntil: "load" });
    await page.waitForTimeout(3500); // let the scene mount
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(80);
    }
    await page.locator("details").first().locator("summary").click();
    expect(problems).toEqual([]);
  });
}
