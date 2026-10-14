import { defineConfig, devices } from "@playwright/test";

// 3100, not 3000: a dev server is usually already on 3000, and these tests must
// talk to the build they started, not whatever happens to be running.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // A test that only passes on retry is a flaky test; make it visible.
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    // "on", not "only-on-failure": every test attaches its final screenshot to
    // the HTML report, so a passing run is reviewable too, not just a red one.
    // Only tests that open a page produce one — the `request`-fixture API tests
    // never render anything, so they have nothing to capture.
    screenshot: "on",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Production build, not `next dev`: HSTS is production-only, `generateStaticParams`
    // only prerenders here, and E2E should exercise what actually ships.
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Server components fetch their own API through apiBase(), which falls back
      // to localhost:3000. Without this they would call whatever is on 3000
      // instead of the server under test — silently, since none of them check res.ok.
      NEXT_PUBLIC_BASE_URL: baseURL,
      NODE_ENV: "production",
      JWT_SECRET: "e2e-test-secret-at-least-32-characters-long",
    },
  },
});
