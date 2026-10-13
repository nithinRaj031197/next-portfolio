import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
/** WebKit runs by default in CI (Linux). Locally it is opt-in: Playwright's bundled WebKit does not support every macOS version. */
const WEBKIT = CI || process.env.PW_WEBKIT === "1";
const PORT = 3100;
/** Public values the production build is made with. CI sets them; locally they default to harmless placeholders. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:${PORT}`;
const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? "https://example.com/resume.pdf";
/** CI builds once and shares the output between browser jobs, so the server only has to start. */
const PREBUILT = process.env.PW_PREBUILT === "1";

// Software GL, so WebGL works in headless browsers without a GPU.
const SWIFTSHADER = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

/** Locally the bundled Chromium may not support this OS, so use the installed Chrome; CI uses Playwright's own Chromium. */
const chromium = (device: (typeof devices)[string]) => ({
  ...device,
  ...(CI ? {} : { channel: "chrome" as const }),
  launchOptions: { args: SWIFTSHADER },
});

export default defineConfig({
  testDir: "./e2e",
  // Serial: parallel browsers share one CPU for software GL, which starves frame timing and makes WebGL tests flaky.
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["github"], ["list"]] : "list",
  webServer: {
    command: PREBUILT ? `npm run start -- -p ${PORT}` : `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 240_000,
    // A production build needs its public origin (see next.config.mjs). Public, non-secret values; no network is involved.
    env: { NEXT_PUBLIC_SITE_URL: SITE_URL, NEXT_PUBLIC_RESUME_URL: RESUME_URL },
  },
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: "desktop", use: chromium(devices["Desktop Chrome"]) },
    { name: "mobile", use: chromium(devices["Pixel 7"]) },
    // Specs that need WebGL are skipped on WebKit unless PW_WEBKIT_WEBGL=1 (see e2e/helpers.ts: skipWebGLOnWebKit).
    ...(WEBKIT
      ? [
          { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
          { name: "webkit-mobile", use: { ...devices["iPhone 14"] } },
        ]
      : []),
  ],
});
