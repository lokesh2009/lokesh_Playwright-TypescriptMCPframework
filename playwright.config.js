// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { tagExpressionToRegExp } = require('./tests/specs/support/tagExpr');
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional; continue if not installed
}

/**
 * BROWSER keeps the same cross-env semantics the Cucumber suite used
 * (BROWSER=chromium|firefox|webkit), including the comma-separated matrix
 * form used by npm's test:healthcheck:all.
 */
const BROWSER_DEVICE = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};
const browserNames = (process.env.BROWSER || 'chromium')
  .toLowerCase()
  .split(',')
  .map((s) => s.trim())
  .filter((s) => BROWSER_DEVICE[s]);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/specs',
  testMatch: '**/*.spec.js',
  timeout: 5 * 60_000, // Cucumber's setDefaultTimeout(120000) was PER STEP; long tests call test.setTimeout()
  expect: { timeout: 10_000 },

  // TAGS holds a Cucumber-style tag expression, e.g. "@RideNow and @admin".
  grep: process.env.TAGS ? tagExpressionToRegExp(process.env.TAGS) : undefined,

 reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['json', { outputFile: 'reports/playwright-results.json' }],
  ['junit', { outputFile: 'reports/junit-results.xml', embedAnnotationsAsProperties: false }],
  [
    'allure-playwright',
    { resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results', detail: true, suiteTitle: true },
  ],
],

  use: {
    // Headed locally (matches today's local debugging experience);
    // headless in CI or when explicitly requested.
    headless: process.env.HEADLESS === 'true' || !!process.env.CI,
    launchOptions: { slowMo: 100 },
    permissions: ['notifications', 'geolocation'],
    // Cucumber drove Playwright as a raw library, where actions/navigations
    // default to a 30s timeout. Playwright Test's own default is NO timeout,
    // which is fatal for the self-heal `try { await x.selectOption(...) }
    // catch {}` fallback chains used throughout the ported step code: a
    // missing element used to fail fast after 30s so the next fallback
    // selector could run — under Playwright Test it instead hangs until the
    // whole test's timeout, and the fallback never runs at all. Confirmed via
    // live verification: identical step code passed under Cucumber (30s
    // timeout -> catch -> fallback) and failed under Playwright Test with no
    // timeout set here.
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    // Playwright's own built-in capture (tests/specs/support/fixtures.js's
    // afterEach just points a TestRail annotation at whatever these produce).
    // Screenshots are taken for every test, pass or fail. Video stays
    // failure-only by default (much heavier); individual spec files (e.g.
    // valkeyScenario.spec.js) override `video` to 'on' where a recording is
    // wanted even for a passing test.
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 1,

  projects: browserNames.map((name) => ({
    name,
    use: { ...devices[BROWSER_DEVICE[name]] },
  })),
});
