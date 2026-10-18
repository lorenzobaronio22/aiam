import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

/**
 * The Gherkin feature files under `docs/testing/features` are the single source
 * of truth for end-to-end behaviour. `bddgen` compiles them into Playwright
 * specs in `.features-gen`, which `playwright test` then runs.
 */
const testDir = defineBddConfig({
  // The canonical Gherkin lives in the docs; `featuresRoot` anchors the
  // generated specs to the same tree so the report mirrors the documentation.
  featuresRoot: path.resolve(import.meta.dirname, "../../docs/testing/features"),
  features: "../../docs/testing/features/**/*.feature",
  // `fixtures.ts` must be loaded here so bddgen can discover the extended
  // `test` instance that the generated specs should import.
  steps: ["fixtures.ts", "steps/**/*.ts"],
});

const webUrl = process.env.E2E_WEB_URL ?? "http://localhost:5173";
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8787";

export default defineConfig({
  testDir,
  // The API keeps members in memory for the whole run and scenarios share it,
  // so run them one at a time and keep each scenario's data namespaced.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "vp -C ../../apps/api exec tsx src/index.ts",
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "vp -C ../../apps/website dev --port 5173 --strictPort",
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
