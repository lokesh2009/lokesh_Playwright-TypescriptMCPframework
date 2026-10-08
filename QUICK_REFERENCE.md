# 📋 Quick Reference Card

## 🎯 Framework Status

| Component | Status | Details |
|-----------|--------|---------|
| **Primary runner** | ✅ | Playwright Test 1.61.0 — UI, API, CriticalClients |
| **Legacy runner** | ⚠️ | Cucumber 9.5.0 — performance suite only (2 features) |
| **Config** | ✅ | `playwright.config.js` (real entry point), `actionTimeout`/`navigationTimeout` set to 30s |
| **Reporting** | ✅ | Playwright HTML/JSON + TestRail annotations (Playwright suite); Allure (performance suite) |
| **Tests** | ✅ | 226 tests across 20 spec files, plus 2 Cucumber performance features |

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Run a quick, cheap check (no browser, fast)
npx playwright test tests/specs/APIFeature/A123Feed.spec.js

# 2. View the report
npx playwright show-report

# 3. Run something real (needs VPN)
npx playwright test tests/specs/CriticalClients/RideNow.spec.js
```

---

## 💻 Where things actually are

| What | Location |
|------|---------|
| Playwright specs (write new tests here) | `tests/specs/<UIFeature\|APIFeature\|CriticalClients>/*.spec.js` |
| Shared lifecycle/fixtures | `tests/specs/support/fixtures.js` |
| Evidence/attachment helpers | `tests/specs/support/evidence.js` |
| Shared step logic (was duplicated Cucumber steps) | `tests/specs/support/commonActions.js` |
| Tag-expression parser for the `TAGS` env var | `tests/specs/support/tagExpr.js` |
| Page Objects | `Pages/*.js` |
| Test data | `Pages/TestData/*.js`, `Utility/testDataFixture.js` |
| Self-heal selector fallback engine | `Utility/selfHealFixture.js` |
| Real Playwright config | `playwright.config.js` |
| Remaining Cucumber content (performance only) | `tests/features/performance/`, `tests/steps/performance/`, `Setup/hooks.js` |

---

## 🎯 Common Tasks

```
Task                              Command
──────────────────────────────────────────────────────────────────────
Run everything                    npm run test
Run just UI specs                 npm run test:ui
Run just API specs                npm run test:api
Run RideNow module sweep          npm run test:ridenow
Preview sites, control (DSP-5009) npm run test:preview-sites:control
Autoresponder leads (DSP-4709)    npm run test:dsp4709   then  npm run report:dsp4709
One spec + its own Allure report  npm run test:preview-sites:report  (or test:ridenowfull:report)
Run one spec file directly        npx playwright test tests/specs/<Folder>/<name>.spec.js
List tests without running        npx playwright test --list
Filter by tag                     cross-env TAGS="@smoke" npx playwright test
Run performance suite (Cucumber)  npm run test:performance
View Playwright report            npx playwright show-report
View Allure report               npm run report:generate && npm run report:open
Open one spec's Allure report     npx allure open reports/allure-<name>
Encrypt a .env secret             node Utility/envCrypto.js encrypt   (needs ENV_SECRET_KEY)
Check code quality                npm run lint
──────────────────────────────────────────────────────────────────────
```

---

## 🏷️ Tag filtering — use `TAGS`, not bare `--grep`

Playwright's own `--grep` is case-**insensitive**, and this suite has tags that differ only by case (`@smoke` vs `@Smoke`). Always go through the `TAGS` env var, which supports the same Cucumber tag-expression syntax as before:

```bash
cross-env TAGS="@smoke" npx playwright test
cross-env TAGS="@RideNow and @admin" npx playwright test
cross-env TAGS="@smoke or @dealerspike" npx playwright test
cross-env TAGS="not @performance" npx playwright test
cross-env TAGS="@PreviewSites and not @previewHost" npx playwright test   # never hits preview (production-DB) hosts
```

---

## 🆘 When You Need Help

| Problem | Where to look |
|---------|----------|
| "How do I write a test?" | Read `tests/specs/CriticalClients/RideNow.spec.js` end to end — it's the reference example for placeholder-based Scenario Outlines, browser-less tests, and long-running step timeouts |
| "How do I write a *data-driven* test?" | See the array-of-rows + `for` loop pattern in `tests/specs/UIFeature/valkeyScenario.spec.js` |
| "Test failed, what now?" | Check `playwright-report/index.html` (`npx playwright show-report`) — every test now gets a screenshot, failures also get a video + trace |
| "How do I debug a hang near the 5-minute mark?" | Check `playwright.config.js` still has `actionTimeout`/`navigationTimeout: 30_000` — without them, a missing element's self-heal fallback hangs instead of failing fast |
| "Where is the old `.feature` file for X?" | If X was UI/API/RideNow, it's gone — converted to the matching `*.spec.js`. Only the 2 performance features are still Gherkin. |
| "I need the deep architectural explanation" | `Skills/SKILL.md` (local-only, gitignored — ask a teammate to share it if you don't have a copy) |

---

## 📁 File Locations

```
Tests (write new tests here)
├─ tests/specs/UIFeature/*.spec.js          UI test specs
├─ tests/specs/APIFeature/*.spec.js         API test specs
├─ tests/specs/CriticalClients/*.spec.js    RideNow / ridenowfull
└─ tests/specs/support/                     fixtures.js, evidence.js, commonActions.js, tagExpr.js

Page Objects & data
├─ Pages/*.js                               One class per page/site
├─ Pages/TestData/*.js                      Static module/menu catalogs
└─ Utility/testDataFixture.js               Credentials, URLs, timeouts

Still-Cucumber content (performance only)
├─ tests/features/performance/*.feature     lighthouse.feature, load_test.feature
├─ tests/steps/performance/*.js             Step definitions for the above
└─ Setup/hooks.js                           Cucumber lifecycle — performance suite only now

Reports & Output
├─ playwright-report/index.html             Playwright's own HTML report
├─ reports/playwright-results.json          JSON report
├─ reports/videos/, reports/*.png           Screenshots and Valkey/failure videos
├─ tests/test-results/*-execution-report.html   Custom per-feature HTML reports (both suites)
└─ allure-results/, allure-report/          Allure — performance (Cucumber) suite only
```

---

## ✅ Before You Start

- [ ] Node.js 18+ installed: `node --version`
- [ ] Dependencies installed: `npm install`
- [ ] Playwright browsers installed: `npx playwright install`
- [ ] VPN connected (most target sites are internal QA sandboxes)
- [ ] `.env` file created with `EMAIL`/`PASSWORD` and any suite-specific URLs
- [ ] Can list tests with no errors: `npx playwright test --list`

---

## 🎓 By Experience Level

### 👶 New to this repo
1. Run: `npx playwright test tests/specs/APIFeature/A123Feed.spec.js` (fast, no browser)
2. View: `npx playwright show-report`
3. Read: `tests/specs/CriticalClients/RideNow.spec.js` for a real, fully-worked example

### 🧑 Writing your first test
1. Pick an existing spec in the same folder as a template (e.g. `tests/specs/UIFeature/admin.spec.js` for an admin-console flow)
2. Reuse a Page Object from `Pages/`, or create one if the flow is new
3. Import `{ test }` from `../support/fixtures` and evidence helpers from `../support/evidence`
4. Run it directly: `npx playwright test tests/specs/<Folder>/<name>.spec.js`

### 👨‍🔬 Advanced
1. Read `tests/specs/support/fixtures.js` fully — the `beforeEach`/`afterEach` lifecycle, TestRail annotation flow, and the video-teardown-timing workaround are all documented inline
2. Convert the remaining Cucumber performance suite to Playwright Test (not yet done — same recipe as everything else here)
3. Update `Docs/specs/QA-PRINCIPLES.md` and the SDD templates — they still assume Gherkin conventions

---

## 📊 Quick Stats

```
Spec files ......................... 20 (17 UIFeature + 2 CriticalClients + 1 APIFeature)
Tests in the Playwright suite ...... 226
Remaining Cucumber features ........ 2 (Lighthouse, K6 load test)
Page Objects ........................ 18
NPM scripts ......................... ~50
```

---

## 💡 Pro Tips

1. **Don't use bare `--grep` for tags** — use `TAGS="..."` (see above), or the explicit `/…/` regex form if you need case-sensitive ad-hoc filtering.
2. **A test that doesn't request `page`/`context` never launches a browser** — useful for API-only or catalog-integrity checks (see `A123Feed.spec.js`, or the browser-less scenario in `RideNow.spec.js`).
3. **If a long test times out even though its own step has a generous `{ timeout }`** — add `test.setTimeout(...)` at the top of the test to cover the sum of its steps; the step's own timeout only bounds that one step, not the whole test.
4. **`commonActions.openSite()` returns the live page** after a possible self-heal tab-swap — always capture and reassign it (`page = adminPage.page`), never discard the return value.
5. **Screenshots are captured for every test now**, pass or fail (`screenshot: 'on'` in config) — video stays failure-only by default, with per-file overrides (like Valkey) for always-on recording.

---

## 📞 Help Resources

| Need | Where |
|------|-------|
| Deep architecture walkthrough | `Skills/SKILL.md` (gitignored — local copy only) |
| A real, fully-worked spec example | `tests/specs/CriticalClients/RideNow.spec.js` |
| Data-driven (Examples-table style) pattern | `tests/specs/UIFeature/valkeyScenario.spec.js` |
| Shared step logic pattern | `tests/specs/support/commonActions.js` |
| This card | `QUICK_REFERENCE.md` |

---

*Framework: Playwright Test 1.61.0 (primary) + Cucumber 9.5.0 (performance suite only) + JavaScript*
*Status: UI/API/CriticalClients migrated · Performance suite still Cucumber-only*
*Start: `npx playwright test --list`*
*Report: `npx playwright show-report`*
