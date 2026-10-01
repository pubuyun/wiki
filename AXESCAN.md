# Run another axe accessibility scan

Scan the existing website at `http://localhost:3000` with Playwright and axe-core. Save JSON and HTML reports outside this repository. Do not build the Nuxt project or start a development server as part of the scan.

## Ask an agent to run the scan

Copy this prompt into a new chat opened in this project:

```text
Read AXESCAN.md and run a fresh Playwright + axe-core accessibility scan
against the existing http://localhost:3000 website.

Follow the fresh-run procedure in this document. Keep dependencies,
scanner scripts, and reports outside the project. Preserve all previous
reports. Do not modify website source, build Nuxt, or start a server.
If port 3000 is unavailable, ask me to start the existing server.

Check desktop 1440x900 and mobile 390x844 using the documented WCAG
2.2 A/AA rule tags. Retest the previous URLs and discover new linked
pages. Use isolated browser processes with timeouts. Reject results
for blank documents and record failed scans rather than counting
them as passes. Finalize and verify the HTML report.

Return links to the new JSON and HTML reports, a comparison with the
previous findings, and any failures or coverage gaps. Report website
findings separately from development-tool findings. Do not infer full
WCAG AA conformance from the automated results.
```

## Prerequisites

- The existing website must already be accessible at `http://localhost:3000`. Start your usual development server yourself if needed.
- Windows, Node.js, npm, RTK, and Microsoft Edge must be installed. These scanner scripts use headless Edge through Playwright.
- Keep the website stable during the scan so results from different pages are comparable.
- The original local scanner folder must still exist:
  `C:\Users\wzh_z\.codex\a11y-audits\wiki-2026-10-02`.

The following commands install dependencies only in a new local audit folder. They do not change this repository's dependencies or lockfile.

## Run a fresh scan in PowerShell

### 1. Check the server and prepare a new folder

Run this block first. It stops if the homepage is unavailable and creates a unique output folder for each run.

```powershell
$ErrorActionPreference = 'Stop'
Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 15 -UseBasicParsing | Out-Null

$scannerSource = 'C:\Users\wzh_z\.codex\a11y-audits\wiki-2026-10-02'
$auditParent = 'C:\Users\wzh_z\.codex\a11y-audits'
$scanStamp = Get-Date -Format 'yyyy-MM-dd-HHmmss-fff'
$scanDirectory = Join-Path $auditParent "wiki-$scanStamp"
New-Item -ItemType Directory -Path $scanDirectory | Out-Null

$scannerFiles = @(
    'scan.cjs', 'single-scan.cjs', 'resume.cjs', 'finalize.cjs',
    'package.json', 'package-lock.json'
)
foreach ($scannerFile in $scannerFiles) {
    Copy-Item -LiteralPath (Join-Path $scannerSource $scannerFile) -Destination $scanDirectory
}

rtk proxy npm.cmd ci --prefix $scanDirectory --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Local scanner dependency installation failed.' }
```

### 2. Initialize fresh results

This creates an empty scan using the previous coverage list and configuration. It does not reuse previous findings. Retaining the old URLs helps detect regressions; the crawler also discovers newly linked pages.

```powershell
$seedScript = Join-Path $scanDirectory 'seed.cjs'
@'
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const axe = require('axe-core');

async function main() {
  const previous = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const urls = [...new Set([previous.baseUrl + '/', ...previous.discoveredUrls])];
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let browserVersion;
  try { browserVersion = browser.version(); }
  finally { await browser.close(); }

  const report = {
    status: 'running',
    startedAt: new Date().toISOString(),
    baseUrl: previous.baseUrl,
    target: previous.target,
    tags: previous.tags,
    versions: {
      playwright: require('playwright/package.json').version,
      axeCore: axe.version,
      axePlaywright: JSON.parse(fs.readFileSync(
        path.join(__dirname, 'node_modules/@axe-core/playwright/package.json'),
        'utf8'
      )).version,
    },
    browser: `Microsoft Edge ${browserVersion}`,
    profiles: previous.profiles,
    excludedSelectors: previous.excludedSelectors,
    scope: previous.scope,
    limitations: previous.limitations.filter(text => !text.includes('legacy mode')),
    rules: axe.getRules(previous.tags).map(rule => ({
      id: rule.ruleId, tags: rule.tags, description: rule.description,
    })),
    scans: [],
    discoveredUrls: urls,
    pendingUrls: urls,
    comparisonBaseline: process.argv[2],
  };
  fs.writeFileSync(path.join(__dirname, 'report.json'), JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
'@ | Set-Content -LiteralPath $seedScript -Encoding UTF8

$baselineReport = Join-Path $scannerSource 'report.json'
rtk proxy node $seedScript $baselineReport
if ($LASTEXITCODE -ne 0) { throw 'Fresh scan initialization failed.' }
```

To compare against a more recent scan, set `$baselineReport` to that run's `report.json` before executing the last two lines.

### 3. Scan, finalize, and open the report

Run these commands sequentially, waiting for each to finish:

```powershell
rtk proxy node (Join-Path $scanDirectory 'resume.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Scan interrupted. Review the saved report before continuing.' }

rtk proxy node (Join-Path $scanDirectory 'finalize.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Report finalization failed. Preserve the saved results.' }

Invoke-Item -LiteralPath (Join-Path $scanDirectory 'report.html')
Write-Output "Reports saved in: $scanDirectory"
```

Despite its name, `resume.cjs` performs a fresh scan here because step 2 initialized an empty `scans` array. It uses isolated browser processes, scans desktop and mobile sizes, and enforces a 75-second deadline per check.

Do not run `scan.cjs` directly for this workflow: its original shared-browser loop stalled on the model viewer. It is copied because the other scripts use its report renderer.

`finalize.cjs` retries eligible failures, rejects results belonging to blank documents, adds the website/development-tool breakdown, and verifies the HTML layout at desktop and mobile sizes. Read the saved reports for the authoritative totals; the runner's final console summary can be stale.

## Files and interpretation

Each run produces:

- `report.html`: readable findings, affected elements, coverage, failures, and manual-review items.
- `report.json`: full raw results, including `violations`, `passes`, `incomplete`, `inapplicable`, and recorded invalid attempts.
- `report-preview.png`: an image of the report's first screen for visual verification.

Check `status`, `summary.failedScans`, and `pendingUrls` before interpreting results. A completed scan can still contain violations. `completed-with-scan-errors` means coverage is incomplete; failed checks are not passes.

Use `websiteFindingsByRule` to compare website issues. Counts include repeated occurrences across pages and viewports, not necessarily distinct source defects. Development-tool findings remain in the raw results and are counted separately in the finalized report.

The initial scan encountered 404 responses for `/model/Baidu.com` and `/model/Google.com`, and invalid mobile results for two viewer routes. Inspect these checks in each new report rather than assuming they have passed.

## Coverage and limits

- Rule tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22a`, `wcag22aa`.
- Desktop: 1440 × 900. Mobile: 390 × 844, with mobile and touch emulation.
- Browser preference: reduced motion. Lazy content is requested by scrolling up to 30,000 pixels.
- The crawler follows same-origin links and strips query strings and fragments. It stops at 200 URLs and records any remaining URLs.
- Nuxt DevTools elements and a11y badges are excluded. Nuxt Studio findings are retained and classified as development tooling.
- Initial page states are scanned. Open menus, dialogs, form errors, alternate accessibility modes, unlinked routes, and external embedded content need additional checks.
- `incomplete` results require human review. Automated results alone do not establish WCAG AA conformance.

## Resume an interrupted run

Keep that run's folder and set `$scanDirectory` to its absolute path. Run step 3 again. Successful saved checks are retained; missing or failed checks are retried. This resumes the existing run, so use steps 1–3 when you need a fresh assessment after website changes.

If port 3000 is unavailable, restore the existing server before retrying. If the local scanner folder or its scripts are missing, recreate the scanner outside the repository before continuing; do not substitute a Nuxt build.
