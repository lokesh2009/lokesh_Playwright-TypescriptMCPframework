# 🎭 Playwright JS E2E Automation Suite

This repository contains a JavaScript-based end-to-end automation framework for a set of DealerSpike/LeadVenture QA sites. As of this update, UI/API/CriticalClients coverage runs on **native Playwright Test** (`*.spec.js`). Cucumber/Gherkin remains only for the two performance features (Lighthouse audit, K6 load test trigger) that haven't been converted yet.

## ✅ What's included

- Native Playwright Test specs for UI, API, and critical-client (RideNow) coverage
- Self-heal selector fallback chains for brittle/drifting site markup
- Page Object Model classes shared across specs
- Cucumber/Gherkin — performance suite only (Lighthouse, K6)
- Playwright's own HTML/JSON reporting, TestRail evidence annotations, plus Allure for the remaining Cucumber suite
- MCP server integration for real-time test/health monitoring

## 📦 Prerequisites

- Node.js 18+ (the project is currently aligned with Node 22 in the environment)
- npm
- Git
- A terminal such as PowerShell, Command Prompt, or Bash
- **VPN connection** — most target sites are internal `*.qa.dsp.leadventure.dev` sandboxes; DNS fails hard off-VPN

## 🚀 Installation

```bash
git clone https://lokeshsharma4@bitbucket.org/aridevelopment/ds-qa-automation-repo.git
cd ds-qa-automation-repo
npm install
npx playwright install
```

## 🧪 Running tests

Common commands available in this repository:

```bash
npm run test               # Everything: Playwright suite + the Cucumber performance suite
npm run test:ui            # All UIFeature specs
npm run test:api           # All APIFeature specs
npm run test:ridenow       # RideNow critical-client module sweep
npm run test:healthcheck   # allsites.spec.js (link health check)
npm run test:valkey        # Page-break + lead-form validation, --workers=4
npm run test:preview-sites:control  # DSP-5009 control-site robots baseline, --workers=4
npm run test:preview-sites:report   # same, plus a consolidated Allure report in reports/allure-preview-sites/
npm run test:dsp4709               # DSP-4709 autoresponder leads for the flag state in DSP4709_FLAG_STATE
npm run report:dsp4709              # judge the autoresponders saved in reports/dsp-4709/emails/
npm run test:performance   # The 2 remaining Cucumber features (Lighthouse, K6)
```

Run a single spec directly:
```bash
npx playwright test tests/specs/UIFeature/admin.spec.js
```

Filter by tag using a Cucumber-style tag expression (kept case-sensitive on purpose — see [Tag filtering](#-tag-filtering) below):
```bash
cross-env TAGS="@RideNow and @admin" npx playwright test
```

List every test without running anything:
```bash
npx playwright test --list
```

## 🏷️ Tag filtering

Playwright's own `--grep` is case-**insensitive** by default, which would silently merge tags this suite deliberately keeps distinct (`@smoke` vs `@Smoke`, `@p1` vs `@P1`). Use the `TAGS` environment variable instead — it accepts the same Cucumber tag-expression syntax the old scripts used (`and` / `or` / `not` / parentheses), converted internally by `tests/specs/support/tagExpr.js`:

```bash
cross-env TAGS="@smoke" npx playwright test
cross-env TAGS="@RideNow and @admin" npx playwright test
cross-env TAGS="@smoke or @dealerspike" npx playwright test
cross-env TAGS="not @performance" npx playwright test
cross-env TAGS="(@smoke or @ui) and not @flaky" npx playwright test
```

## 📁 Project structure

- `tests/specs/` — Playwright Test spec files (**primary**, current), grouped as `UIFeature/`, `APIFeature/`, `CriticalClients/`, plus a `support/` folder for shared fixtures/helpers
- `tests/features/performance/` — the 2 remaining Gherkin features (Lighthouse, K6), plus the K6 scripts themselves
- `tests/steps/performance/` — step definitions for those 2 features only
- `Pages/` — Page Object Model classes for the UI flows (framework-agnostic, reused directly by the specs)
- `Setup/` — `hooks.js` (Cucumber lifecycle, needed only by the performance suite now), report-generation scripts
- `Utility/` — Shared helpers and fixtures (self-heal, auth, test data, report generation) — unchanged, framework-agnostic
- `reports/` — Generated screenshots, videos, and custom HTML reports for test runs
- `allure-results/` / `allure-report/` — Allure results from every Playwright run and the Cucumber performance suite (set `ALLURE_RESULTS_DIR` to send one run elsewhere)
- `playwright-report/` — Playwright Test's own HTML report
- `test-results/` — Playwright's own artifact staging area (traces, per-test screenshots)

## 📈 Reports

- **Playwright suite:** `playwright-report/index.html` (`npx playwright show-report`), `reports/playwright-results.json`, plus per-test evidence pushed as `testInfo.annotations` (`testrail_attachment`/`testrail_comment`) via `tests/specs/support/evidence.js` — no TestRail Case ID mapping is wired in yet, annotations carry evidence only.
- **Playwright suite, Allure + JUnit:** every run also writes Allure results (`allure-playwright`, with screenshots, videos and traces attached) and `reports/junit-results.xml` for TestRail. For one spec's consolidated report use `node Setup/runSpecWithAllure.js <name> <spec>` (wrapped by `npm run test:ridenowfull:report` and `npm run test:preview-sites:report`); open it with `npx allure open reports/allure-<name>`, never by double-clicking `index.html`.
- **Cucumber performance suite:** Allure (`allure-results/` → `npm run report:generate` → `allure-report/index.html`), same as before.
- **Both suites** also write to the custom per-feature `tests/test-results/<name>-execution-report.html` reports and the Valkey/error-check HTML reports where applicable.

Generated reports/results are intended to stay local and are ignored by Git.

## 🤖 MCP server

This repo ships its own monitoring server (`mcp-server.js`) with health/metrics/results endpoints, separate from any generic Playwright MCP tooling:

```bash
npm run mcp:start
# Server listens on http://localhost:5000
```

## 🔧 Notes

- The Playwright suite's real configuration is `playwright.config.js` — `testDir: './tests/specs'`, `use.actionTimeout`/`use.navigationTimeout` set to `30_000` (Cucumber's raw-library default; Playwright Test's own default is *no timeout*, which breaks the self-heal fallback chains used throughout the ported code if removed).
- Environment-specific values (`EMAIL`, `PASSWORD`, `BROWSER`, `TAGS`, API URLs) belong in a local `.env` file, not committed to source control.
- `EMAIL`, `PASSWORD`, `TESTRAIL_USERNAME` and `TESTRAIL_PASSWORD` are stored encrypted (`enc:…`) and read through `readSecret()` in `Utility/envCrypto.js`. The key is `ENV_SECRET_KEY`, set in your user environment or as a CI secret, never in `.env`. `node Utility/envCrypto.js keygen` creates a key; `node Utility/envCrypto.js encrypt` encrypts a value.
- DSP-5009 preview sites (`tests/specs/UIFeature/previewSites.spec.js`):
  - `PREVIEW_CONTROL_V7_URL`, `PREVIEW_CONTROL_RIDENOW_URL` — optional; default to the Admin suite's QA hosts.
  - `PREVIEW_SITE_V6_URL`, `PREVIEW_SITE_V7_URL` — no default. Preview hosts use the **production database**, so leave these empty until the spec's Risk 1 is approved; the preview tests are skipped while they're unset.
- DSP-4709 autoresponder check (`tests/specs/UIFeature/autoresponderLocation.spec.js`, tag `@AutoResponder`): `DSP4709_SBX_URL`, `DSP4709_QA_URL` (no defaults), `DSP4709_FLAG_STATE` (`on`/`off`, must match the dealer setting), `DSP4709_INBOX` (mailbox that receives the autoresponders; each lead is plus-addressed). Leads on the **same unit** must be submitted minutes apart — the platform silently drops near-simultaneous duplicates.
- Cucumber configuration for the remaining performance suite is inlined per npm script in `package.json` (no standalone `cucumber.js` file).

---

## 🧩 Current test coverage

### UI (`tests/specs/UIFeature/`)
Admin console workflows, inventory filtering (multiple sites/verticals), leads/events admin, part requests, testimonials, sitemap generation/validation, site-prerequisite screenshot capture, page-break/lead-form validation (Valkey, 55 scenarios), and the large V7 Powersports inventory suite (42 scenarios).

**Preview sites (DSP-5009)** — `previewSites.spec.js`, tags `@PreviewSites` (module), `@previewHost` and `@readonly` (preview-host checks, excluded from the default run with `not @previewHost`). Today it checks that robots directives on 5 page types of the 2 QA control sites still match the baseline in `Pages/TestData/previewRobotsBaseline.json`; the preview-host half is planned in `Docs/specs/DSP-5009-preview-admin-noindex/`.

### Critical Clients (`tests/specs/CriticalClients/`)
- **RideNow** — public/admin module health sweep with self-healing selector chains, verified against the documented module coverage report
- **ridenowfull** — multi-site inventory filtering + lead submission on the QA box

### API (`tests/specs/APIFeature/`)
Dealer data consistency check between two feed APIs (`A123Feed.spec.js`) — note its comparison step is a known, intentionally-preserved stub that always fails (the two APIs return structurally different formats with no field-mapping rules defined yet).

### Performance (`tests/features/performance/`, still Cucumber)
- `lighthouse.feature` — Lighthouse performance audit
- `load_test.feature` — K6 load-test trigger, backed by the K6 scripts in the same folder

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

> ⚠️ `Utility/Jenkinfile` has **not** been updated for this migration yet — it still drives the modules that have moved to Playwright Test via `npx cucumber-js`. Treat that as a tracked follow-up, not a working reference.

---

## 🛠️ Troubleshooting

### Tests hang or time out inside a self-heal fallback
`playwright.config.js`'s `use.actionTimeout`/`use.navigationTimeout` must stay set to `30_000`. Without them, a missing element's `try { await x.click() } catch {}` fallback chain hangs until the whole test's timeout instead of failing fast into the next selector — this was a real, confirmed bug found during the Cucumber→Playwright migration.

### Browser not found
```bash
npx playwright install
```

### A spec using `commonActions.openSite()` doesn't recover from a slow/failed navigation
Confirm the call site captures and reassigns the return value:
```javascript
const adminPage = await openSite(page, reporting, url);
page = adminPage.page; // self-heal may have swapped to a new tab
```

### Video missing for a passing test that should have recorded one (e.g. Valkey)
Playwright wipes its own `test-results/` staging area at the start of each `playwright test` invocation. Running two `playwright test` processes against the same checkout at the same time can delete one run's in-progress video before it gets copied out. Don't run overlapping Playwright invocations against one working copy.

### Undefined step (Cucumber performance suite only)
1. Check the step text matches exactly (case-sensitive)
2. Ensure the step file lives under `tests/steps/performance/`
3. Confirm it's covered by the `--require` flags in the relevant `test:performance*` npm script

### Cannot find module
```bash
rm -rf node_modules package-lock.json
npm install
```

### Report not generated
1. Run the tests first
2. Playwright's own report is at `playwright-report/index.html` (run `npx playwright show-report`)
3. Allure (performance suite only): `npm run report:generate` then open `allure-report/index.html`

---

## 📚 Best Practices

### Writing new specs
1. **Keep tests focused** — one behavior per `test()`, same as one behavior per old Gherkin scenario.
2. **Use descriptive `test.step()` titles** — they're kept in Given/When/Then phrasing for readability, but there's no Cucumber runtime behind them:
   ```javascript
   await test.step('Given I am on the home page', async () => { /* ... */ });
   ```
3. **Reuse Page Objects** — never scatter selectors directly in a spec file; put them in a `Pages/*.js` class.
4. **Tag appropriately** — `test(title, { tag: ['@smoke', '@ui'] }, async (...) => {...})`, and let feature-level tags on the enclosing `test.describe()` cascade down instead of repeating them.
5. **Reuse shared step logic** — anything that would have been a Cucumber step reused across many `.feature` files belongs in `tests/specs/support/commonActions.js`, not copy-pasted per spec.

### Maintenance tips
1. Review the Playwright HTML report after every run — it shows pass/fail, screenshots (every test now, not just failures), and traces.
2. Keep `Pages/*.js` selectors up to date using the self-heal healing recommendations logged by `Utility/selfHealFixture.js`.
3. Archive/clean local `reports/`, `test-results/`, and `allure-results/` periodically — they're gitignored and can grow large.

---

## 📝 Contributing

### Adding a new test
1. Create `tests/specs/<Folder>/<name>.spec.js` directly — no separate feature file + step-definition pair needed.
2. Reuse or create a Page Object under `Pages/` for any new UI interaction.
3. Import `{ test }` from `tests/specs/support/fixtures.js` and `{ attachText, attachScreenshotFile }` from `evidence.js` for evidence capture.
4. Run it locally: `npx playwright test tests/specs/<Folder>/<name>.spec.js`.
5. Add an npm script if it's a suite people will run often.

### Code style
- Use camelCase for variables, PascalCase for classes
- Keep Page Object methods focused and self-heal-aware (selector fallback chains, not a single brittle selector)
- Add JSDoc comments where the *why* isn't obvious from the code

---

## 📄 License

ISC License - See LICENSE file for details

## 👥 Author

**Lokesh Sharma**

---

## 🎉 Quick Start Summary

```bash
# 1. Clone and setup
git clone https://lokeshsharma4@bitbucket.org/aridevelopment/ds-qa-automation-repo.git
cd ds-qa-automation-repo
npm install
npx playwright install

# 2. Run a quick check
npx playwright test tests/specs/APIFeature/A123Feed.spec.js

# 3. View the report
npx playwright show-report
```

---

**Last Updated**: September 2026 — Cucumber-to-Playwright-Test migration (UI/API/CriticalClients)
**Framework Version**: Playwright Test 1.61.0 (primary) + Cucumber 9.5.0 (performance suite only)
**Status**: ✅ UI/API/CriticalClients on Playwright Test · ⚠️ Performance suite still Cucumber-only

---

## ✅ Checklist for New Team Members

- [ ] Clone repository
- [ ] Install Node.js 18+ (22 recommended)
- [ ] Run `npm install`
- [ ] Run `npx playwright install`
- [ ] Connect to VPN
- [ ] Create a local `.env` with `EMAIL`/`PASSWORD` and any suite-specific URLs
- [ ] Run a quick check: `npx playwright test tests/specs/APIFeature/A123Feed.spec.js`
- [ ] View the report: `npx playwright show-report`
- [ ] Read a real example end to end: `tests/specs/CriticalClients/RideNow.spec.js`
- [ ] Review `tests/specs/support/fixtures.js` to understand the lifecycle/reporting model
- [ ] Ready to write new tests!

---

**Questions?** Check the troubleshooting section above, or read `Skills/SKILL.md` for a deeper architectural walkthrough.
