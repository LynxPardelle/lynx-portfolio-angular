# Codex Notes

## 2026-06-18 15:33 CST - Angular SSR/AWS migration review

- Repo path: `C:\Users\lince\Documents\GitHub\lynx-portfolio-angular`.
- Current branch observed during review: `main`.
- Current app is Angular 20.3.x in `package.json`, while official Angular docs and npm registry show Angular 22 as the current line (`@angular/core` 22.0.2, `@angular/cli`/`@angular/ssr` 22.0.3 observed during review).
- Baseline `npm run build` succeeded, but prerender emitted real SSR/runtime issues:
  - `ReferenceError: window is not defined` in lazy route chunks.
  - Missing stylesheet paths for `assets/css/angora-styles.css` and `assets/css/angora-styles-responsive.css`.
  - Build-time request to `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all` returned 404 with `{status:'error', message:'No hay articulos.'}`.
  - Initial browser bundle exceeded the configured 1 MB warning budget.
- Baseline `npm test -- --watch=false --browsers=ChromeHeadless` failed before running tests because:
  - `BlogSubcatBadgetsComponent` spec imports a misspelled export; actual class is `BlogSubCatBadgetsComponent`.
  - `LinkifyPipe` spec constructs the pipe without the required `WebService` dependency.
- Baseline `npm audit --omit=dev` reported production vulnerabilities, including critical Angular SSR issues in the current 20.x SSR range and Express transitive issues.
- Upgrade should not be mixed with AWS frontend migration in one large commit. Recommended sequence:
  1. Stabilize Angular 20 baseline: fix SSR browser-global crashes, missing Angora CSS asset paths, test compile failures, and production audit issues.
  2. Add Angular AI assistant configuration for safe documentation/search/migration support.
  3. Upgrade major versions in controlled steps toward Angular 22, validating SSR build, tests, and browser smoke after each step.
  4. Prepare AWS SSR deployment artifact and CI/CD once the app renders reliably.
- Angular AI tooling to use:
  - Angular CLI MCP server for documentation search, best practices, project listing, examples, and migration helpers.
  - Angular AI rules / `llms.txt` guidance as reference material for agents.
  - Angular Web Codegen Scorer for evaluating generated Angular code quality when useful.
  - Do not enable WebMCP in the production portfolio by default; official docs mark it experimental and it exposes browser-side AI tools, so it should require a separate product/security decision.
- Frontend ownership decision:
  - `lynx-portfolio-angular` should own Angular source, SSR build, frontend tests/smoke checks, and release artifact generation.
  - `portfolioLynxPardelle-aws-infra` should own AWS resources, OIDC deploy roles, CloudFront/S3/Lambda or equivalent SSR hosting, domain wiring, and promotion.
- AWS migration note: `api.lynxpardelle.com` already represents the new serverless API target in the infra work. Frontend migration should verify rendered UI and API data together, not only network responses.
- Security note: do not store temporary Dokploy/API keys or copied secrets in this repo. Credential rotation remains deferred by project decision, but final cleanup must revisit exposed or long-lived credentials.

## 2026-06-18 15:53 CST - Frontend SSR/test stabilization

- Branch observed: `work/frontend-aws-ssr-angular22`.
- Fixed the two known test compile blockers:
  - `BlogSubcatBadgetsComponent` spec now imports `BlogSubCatBadgetsComponent`.
  - `LinkifyPipe` spec now provides the required `WebService` constructor argument.
- Narrow spec validation passed with `TOTAL: 2 SUCCESS`.
- SSR build now completes with exit 0 after guarding route-component browser globals and moving the `BookComponent` interval/image work behind browser checks.
- Safe Angular AI/MCP repo stance: keep AI/MCP usage documentation-only/read-only for now; do not add secrets, external credentials, production WebMCP, or browser-exposed AI tooling without an explicit product/security decision.
- Remaining risks: production Angular 20 SSR audit vulnerabilities remain until framework upgrade; full Karma suite still has unrelated provider/standalone-test/template failures; prerender still logs the article API 404 and Angora stylesheet warnings.

## 2026-06-18 16:02 CST - Full Karma stabilization

- Branch observed: `work/frontend-aws-ssr-angular22`.
- Stabilized the full Karma suite by moving standalone component specs from `declarations` to `imports`, adding targeted Angular test providers for HTTP, router, NgRx store, modal, translate, and no-op animations, and keeping non-standalone component specs declared with only the needed local imports/providers.
- Fixed the real `GenericInputComponent` template syntax bug by removing the duplicate `let $last = $last` alias in the `@for` loop.
- Validation: `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 25 SUCCESS`.
- Validation: `npm run build` exited 0.
- Remaining non-blocking warnings observed: stale `baseline-browser-mapping`, direct `eval` warnings in article/article-sections/generic-input code, Angora stylesheet lookup warnings, article API 404 for `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all` with message `No hay artículos.`, initial bundle budget exceeded by 92.04 kB, and `moment` CommonJS optimization bailout.
- No deploy and no commit were performed.

## 2026-06-18 16:44 Central Time - Angular 21 hardening, Angora update, and frontend CI

- Angular was upgraded to the latest compatible major line with current NgRx support: Angular 21.2.x and NgRx 21.1.1.
- Current npm checks returned `@angular/core` latest `22.0.2`, `@ngrx/store` latest `21.1.1` with peer `@angular/core: ^21.0.0`, and `@angular/compiler-cli@latest` requiring TypeScript `>=6.0 <6.1`; Angular 22 was not forced to avoid breaking NgRx compatibility.
- Updated `ngx-angora-css` to 1.6.1 and kept explicit stylesheet targets at `assets/css/angora-styles.css` and `assets/css/angora-styles-responsive.css`.
- Removed `moment`, `ngx-moment`, and `@types/moment`; article dates now use Angular `DatePipe` with Spanish locale data.
- Removed direct `eval` usage from `GenericInputComponent`, `ArticleComponent`, and `ArticleSectionsComponent`. Blog placeholder replacement now resolves safe property paths only.
- Changed server routes from wildcard prerender to wildcard server rendering through `provideServerRendering(withRoutes(serverRoutes))`; validation output now reports `Prerendered 0 static routes`, and the build no longer calls `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all`.
- Disabled production critical CSS inlining because Angular's Beasties inliner resolved the Angora runtime stylesheet links as `C:\assets\...`; the links remain in `src/index.html` because `ngx-angora-css` discovers managed stylesheets through `document.styleSheets`.
- Aligned the initial bundle warning budget to `1.1MB`, keeping the `2MB` error budget unchanged. The validated build reports an initial total of `1.08 MB`.
- Updated the local runtime contract to Angular 21's Node support range: `^20.19.0 || ^22.12.0 || >=24.0.0`.
- Added `.github/workflows/angular-validate.yml` with Node 22, `npm ci`, `npm audit --omit=dev`, headless Karma, and production build checks.
- Validation passed:
  - `npm run build` exited 0 with no warnings and `Prerendered 0 static routes`.
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 25 SUCCESS`.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `npm ci --ignore-scripts --dry-run` exited 0 with `up to date`.
- Local SSR smoke passed after `npm run serve:ssr`:
  - `GET http://localhost:6162/` returned 200, `text/html; charset=UTF-8`, length 3045, and contained `<app-root` plus `LynxPortfolio`.
  - `GET http://localhost:6162/assets/css/angora-styles.css` returned 200, `text/css; charset=UTF-8`, length 44.
- Security note: full `npm audit` still exits 1 for 7 dev-only toolchain vulnerabilities in `@babel/core`, `esbuild`, `piscina`, `undici`, and `vite`; npm reported `No fix available` for those chains in the current Angular 21 toolchain.

## 2026-06-18 17:41 Central Time - Menu offcanvas white-screen fix

- User-reported issue: opening the main menu showed a white full-screen panel behind the menu list on local and production.
- Root cause found in `src/app/app.component.html` and Bootstrap CSS: `#offcanvasMenu` used `offcanvas offcanvas-start ank ank-bg-transparent w-100`; Bootstrap's default `--bs-offcanvas-bg: var(--bs-body-bg)` could apply before or instead of the Angora-generated transparent utility, leaving the full-width offcanvas painted white.
- Fix: replaced the Angora-dependent transparent utility with a durable `portfolio-menu-offcanvas` class and explicit SCSS:
  - `--bs-offcanvas-bg: transparent`
  - `--bs-offcanvas-border-width: 0`
  - `background-color: transparent`
  - `border: 0`
- Validation:
  - `npm run build` exited 0, no warnings, `Prerendered 0 static routes`, initial total `1.08 MB`.
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 25 SUCCESS`.
  - Local Chrome CDP measurements after clicking the menu reported `offcanvasBackground: rgba(0, 0, 0, 0)`, `offcanvasVarBg: transparent`, `offcanvasBorderRight: 0px`, `backdropOpacity: 0.5`, `menuListBackground: rgba(0, 0, 0, 0.9)`, and visible menu text `Inicio`, `Proyectos web`, `Demo Reel`, `Book`, `Música`, `CV`.
- Note: the in-app browser automation API could not inspect the current tab because it returned `Agent needs to be enabled first`; the visual flow was verified with local Chrome CDP instead.

## 2026-06-18 18:05 Central Time - AWS SSR artifact packaging

- Added `serverless-http` and `tools/package-ssr-lambda.mjs` so the Angular SSR build can produce `dist/ssr-lambda/ssr-handler.zip` plus `dist/ssr-lambda/manifest.json`.
- Added `.github/workflows/publish-ssr-artifact.yml` for GitHub OIDC artifact publishing to `s3://lynx-portfolio/frontend/angular-ssr/{env}/releases/{releaseId}/`.
- Updated `.github/workflows/angular-validate.yml` so CI validates `npm run package:ssr:lambda` instead of only `npm run build`.
- Added Angular SSR allowed hosts for `lynxpardelle.com`, `www.lynxpardelle.com`, `dev.lynxpardelle.com`, `tst.lynxpardelle.com`, `*.cloudfront.net`, and `*.lambda-url.us-east-1.on.aws`.
- Updated Dockerfile global Angular CLI from 19.2.15 to 21.2.16 so the legacy container path no longer conflicts with the Angular 21 project.
- Local validation:
  - `npm run package:ssr:lambda` exited 0 and produced `dist/ssr-lambda/ssr-handler.zip`.
  - Local Lambda handler smoke returned `statusCode: 200`, `contentType: text/html;charset=UTF-8`, and `hasAppRoot: true`.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 25 SUCCESS`.
- Security note: full `npm audit` still exits 1 for 7 dev-only toolchain advisories in Angular/Vite dependencies, and npm reports no fix available in the current compatible Angular 21 toolchain.

## 2026-06-18 18:46 Central Time - Legacy section render and language button fix

- User-reported dev issue: `/webs` rendered correctly, but `/book`, `/music`, `/reel`, and `/cv` fetched data/assets in Network without consistently rendering visible content; the language dropdown button was transparent.
- Root cause found in the older route components: async API responses and image preload callbacks mutated component fields after SSR/hydration without a reliable view refresh path. `BookComponent` also gated image rendering on a precomputed `width`, so preloaded images could fetch without the actual `<img>` elements being inserted.
- Fix:
  - Added guarded `ChangeDetectorRef` refreshes to `BookComponent`, `MusicComponent`, `DemoreelComponent`, and `CvComponent` after async data loads.
  - Removed the `bookimg.width` template gate so Book images render while width measurement finishes.
  - Cleared the Book shuffle interval on destroy and guarded async refreshes after component destruction.
  - Added static `portfolio-lang-button` and `portfolio-lang-item` styles so the language dropdown does not depend on Angora runtime CSS for its background.
- Validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 25 SUCCESS`.
  - `npm run package:ssr:lambda` exited 0 and produced `dist/ssr-lambda/ssr-handler.zip` with SHA-256 `d1e98f75ebbb73529829e6b0a4505c9123cbca4f2d75964f28315ca71350f26d`.
  - Local SSR smoke against `http://localhost:6173` with Chrome reported `/book` 23/23 images loaded, `/music` 31/31 images loaded, `/reel` 3 iframes, `/cv` 3/3 images loaded, and language button background `rgb(255, 85, 85)`.
- Remaining data issue: `/blog` still calls `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all` and receives HTTP 404, so Blog remains a content/API migration gap separate from the route render bug.

## 2026-06-18 20:22 Central Time - TST SSR, empty blog, and public metadata fixes

- User decision: keep using `https://tst.lynxpardelle.com`; do not add or repair `test.lynxpardelle.com` for this migration path.
- Blog data truth: the recovered backend has no articles, so an empty blog is a valid state, not a content-loading failure.
- Fixed BlogComponent so successful empty article responses and the legacy `404 No hay artículos.` response both render `No hay artículos.` and stop showing `Cargando...`.
- Adjusted Blog SSR behavior so server-rendered `/blog` does not print the loading state when articles are empty.
- Simplified `app.config.server.ts` to server-only providers on top of `appConfig`; the previous server config duplicated router/providers and produced shell-only direct SSR HTML in deployed TST.
- Removed Express `X-Powered-By` from the SSR server.
- Added `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, and `site.webmanifest` to `public/`, and linked the manifest/theme metadata from `src/index.html`.
- Local validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/blog/components/blog/blog.component.spec.ts` exited 0 with `TOTAL: 3 SUCCESS`.
  - `npm run package:ssr:lambda` exited 0 and produced `dist/ssr-lambda/ssr-handler.zip` with SHA-256 `3d154c5c6593978745f8402553116e9ee9d55c50988780a53dbc9b8847b721ca`.
  - Local SSR direct checks with `NG_ALLOWED_HOSTS=localhost,127.0.0.1` showed `/webs` length `67025` and `/blog` length `31863`, both non-shell, with `/blog` containing `No hay artículos.` and not containing `Cargando...`.
  - Local SSR static checks returned `robots.txt` as `text/plain`, `sitemap.xml` as `application/xml`, and `manifest.webmanifest` as `application/manifest+json`.
  - Full `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 27 SUCCESS`.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.

## 2026-06-18 20:46 Central Time - TST remote validation after promotion

- Frontend commit `a998f6941b91f1228e731bc737cda1ac4515f116` was published as the TST frontend release.
- `https://tst.lynxpardelle.com/blog` returned SSR HTML with `No hay artículos.` and without `Cargando...`.
- `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all` returned HTTP `200` with body `{"status":"success","total_items":0,"pages":0,"articles":[]}` after infra promotion to prod.
- Browser route smoke passed on TST for `/`, `/webs`, `/reel`, `/book`, `/music`, `/cv`, and `/blog`.
  - No route showed `Cargando...` after hydration.
  - Displayed image checks reported `0` broken displayed images across the tested routes.
  - `/reel` displayed 3 Dailymotion iframes and no visible error text in the page DOM.
  - `/blog` displayed `No hay artículos.` after hydration.
  - The language button background was `rgb(255, 85, 85)`.
  - The menu offcanvas opened with black page background and visible navigation; no white full-screen panel reproduced.
- Static public metadata was verified remotely:
  - `/robots.txt` returned `text/plain`.
  - `/sitemap.xml` returned `application/xml`.
  - `/manifest.webmanifest` returned `application/manifest+json`.
- Lighthouse reports were saved outside the repo at `C:\Users\lince\Documents\Codex\2026-06-18\lynx-tst-lighthouse`.
  - `/blog`: performance `66`, accessibility `87`, best practices `92`, SEO `100`, LCP `3643 ms`, CLS `0.355`.
  - `/webs`: performance `55`, accessibility `87`, best practices `92`, SEO `100`, LCP `3919 ms`, CLS `0.937`.
  - Lighthouse CLI generated reports but exited with code `1` due to an `EPERM` cleanup error deleting a temporary `lighthouse.*` directory under `%TEMP%`.
- Remaining Lighthouse work is a separate optimization task: add explicit dimensions/reserved aspect ratios for dynamic media and review cache TTL for existing `assets.lynxpardelle.com` media assets.

## 2026-06-18 21:24 Central Time - CV color and /webs CLS fixes

- User-reported TST `/cv` issue: accordion panels showed white/light backgrounds with white text, making content unreadable.
- Root cause: `ngx-bootstrap` generated `.panel.card` and `.card-header` elements; Bootstrap card/header styles overrode Angora `panelClass` background utilities after SSR/hydration.
- Fix: added CV-local CSS variables and `portfolio-cv-panel` styles so panel/header/body/title colors are applied from component state and do not depend on Angora cascade order.
- `/webs` Lighthouse CLS root cause: dynamic media layout depended on Angora runtime-generated sizing/position classes and rendered route content after the first layout.
- Fixes:
  - Added explicit `width`/`height` attributes using observed natural screenshot ratios: desktop `1920x1080`, tablet `533x760`, mobile `369x800`.
  - Moved critical website-device layout from Angora runtime classes to component SCSS.
  - Added SSR-visible loading placeholders to reserve route height before API data arrives.
  - Added fixed header logo dimensions.
- Local validation:
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 27 SUCCESS`.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `npm run package:ssr:lambda` exited 0 and produced `dist/ssr-lambda/ssr-handler.zip` with SHA-256 `e39698d3a64c8ea85c288b032e239654ffa9f59741dd08b1c184e2a542087c45`.
  - Local SSR direct `/webs` returned 200 and initial HTML contained `portfolio-website-skeleton`.
  - Local browser style check for `/cv` reported outer panel `rgb(255, 85, 85)`, outer header text `rgb(249, 194, 79)`, nested panel `rgb(0, 0, 0)`, nested header text `rgb(255, 255, 255)`.
  - Local browser `/webs` check reported `missingDimensionAttrs: 0`, `skeletonCount: 0` after hydration, and first device images loaded with natural dimensions matching the attributes.
  - Local Lighthouse `/webs` report saved at `C:\Users\lince\Documents\Codex\2026-06-18\lynx-cv-cls-lighthouse\webs-local-static-device-css.report.json`: performance `54`, accessibility `87`, best practices `96`, SEO `100`, CLS `0.0607`, LCP `23523 ms`, TBT `202 ms`.
  - Lighthouse CLI still generated reports but exited with code `1` due to the known Windows `%TEMP%\lighthouse.*` cleanup `EPERM` issue.

## 2026-06-18 21:34 Central Time - TST validation for CV/CLS/cache fixes

- PR `https://github.com/LynxPardelle/lynx-portfolio-angular/pull/4` merged to `main` with merge commit `8ea322a8b3c01a6c53da51c3ccc12ad32c7fbe65`.
- GitHub `Angular validate` run `27803467246` passed.
- GitHub `Publish SSR artifact` push run `27803467281` passed for `dev`.
- Manually published TST SSR artifact with `environment=tst` and release id `8ea322a8b3c01a6c53da51c3ccc12ad32c7fbe65`; run `27803506029` passed.
- Infra TST deploy run `27803563133` passed using `FRONTEND_RELEASE_ID=8ea322a8b3c01a6c53da51c3ccc12ad32c7fbe65`.
- TST HTTP confirmed `https://tst.lynxpardelle.com/webs` SSR contains `portfolio-website-skeleton` and `portfolio-website-device-stage`.
- TST browser style check:
  - `/cv` found 19 CV panels.
  - Outer CV panel background `rgb(255, 85, 85)` and text `rgb(255, 255, 255)`.
  - Outer CV header background `rgb(255, 85, 85)` and title color `rgb(249, 194, 79)`.
  - Nested CV panel background `rgb(0, 0, 0)` and nested title color `rgb(255, 255, 255)`.
  - `/webs` had `skeletonCount: 0`, `articleCount: 9`, and `missingDimensionAttrs: 0` after hydration.
- TST route smoke for `/`, `/webs`, `/cv`, `/book`, `/music`, `/reel`, and `/blog` returned HTTP `200`; none contained `Cargando...`; `/blog` contained `No hay artículos.`.
- TST Lighthouse `/webs` report saved at `C:\Users\lince\Documents\Codex\2026-06-18\lynx-tst-lighthouse-cv-cls-cache\webs-tst-after-fixes.report.json`: performance `67`, accessibility `87`, best practices `96`, SEO `100`, CLS `0.0612`, LCP `12054 ms`, TBT `118 ms`.
- Lighthouse CLI again generated JSON/HTML reports but exited with code `1` due to Windows `%TEMP%\lighthouse.*` cleanup `EPERM`.

## 2026-06-18 23:26 Central Time - Production AWS SSR cutover

- Frontend release `8ea322a8b3c01a6c53da51c3ccc12ad32c7fbe65` was published as the production SSR artifact by workflow run `27806547723`; the run completed successfully.
- Infra GitHub Environment `prod` variable `FRONTEND_RELEASE_ID` was set to `8ea322a8b3c01a6c53da51c3ccc12ad32c7fbe65`.
- Infra `Deploy Prod` run `27806936790` completed successfully and deployed CloudFront distribution `E1LHE6N1FDU1U1` / `d1h141iw0hg57g.cloudfront.net` with aliases `lynxpardelle.com` and `www.lynxpardelle.com`.
- Route53 production cutover was applied manually after deploy:
  - Change id `/change/C056671828JEVPY0XZU6T` reached `INSYNC`.
  - `lynxpardelle.com` A/AAAA and `www.lynxpardelle.com` A/AAAA now alias to `d1h141iw0hg57g.cloudfront.net`.
- Production validation:
  - `https://lynxpardelle.com/`, `/webs`, `/cv`, `/book`, `/music`, `/reel`, and `/blog` returned HTTP `200` from CloudFront with non-empty SSR HTML.
  - `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and `/site.webmanifest` returned HTTP `200`.
  - `https://api.lynxpardelle.com/api/article/articles/1/5/_id/all/all` returned exactly `{"status":"success","total_items":0,"pages":0,"articles":[]}`.
  - Browser check on production showed no broken in-viewport images for `/webs`, `/book`, `/music`, `/cv`, or `/blog`.
  - `/blog` displayed `No hay artículos.`.
  - Language button computed style: `backgroundColor` `rgb(255, 85, 85)`, `color` `rgb(0, 0, 0)`, `opacity` `1`.
  - `/cv` nested panel titles computed as white text on black background.
- Follow-up from infra side: codify production frontend Route53 records in CDK, including alternate domain `www.lynxpardelle.com`, so the manual cutover does not remain outside IaC.

## 2026-06-19 00:42 Central Time - CV frontend performance optimization

- Production baseline before this change showed `/cv` as the weakest measured route:
  - Lighthouse desktop production `/cv`: performance `49`, accessibility `88`, best practices `96`, SEO `100`, FCP `742 ms`, LCP `13499 ms`, TBT `3 ms`, CLS `0.4936`, TTFB `1408 ms`.
  - The CV route rendered the decorative background from `https://api.lynxpardelle.com/api/main/get-file/61fdf4f335302351efe129ea`; the asset metadata showed `CVBackground.size` `14093670`.
- Fix:
  - Replaced the initial CV background `<img>` with a decorative background layer that is omitted from the SSR initial image load.
  - Added stable CV dimensions/styles for the profile image, description blocks, accordion width, and admin actions so the route no longer depends on runtime Angora width classes for layout stability.
  - Rewrote CV media URLs to prefer `https://assets.lynxpardelle.com` when API metadata contains the old S3 origin.
  - Generated `public/assets/images/UndergroundSunBackGround.webp` from the existing `public/assets/images/UndergroundSunBackGround.png` using `ffmpeg`; original PNG was `14,093,670` bytes at `2550x3300`, WebP is `983,822` bytes at `1920x2484`.
- Local SSR validation:
  - `npm run build` exited 0; `cv-component` lazy chunk was `42.96 kB` raw / `8.04 kB` estimated transfer.
  - SSR smoke through the local host-rewrite proxy returned HTTP `200` for `/`, `/webs`, `/cv`, `/book`, `/music`, `/reel`, and `/blog`; all had `app-root`, none contained `Loading...`.
  - Local `/cv` initial SSR HTML had `CVBG` present without an inline background URL/style, used `https://assets.lynxpardelle.com/uploads/main/Glitched-Lynx.gif` for `CVImage`, and did not contain `/api/main/get-file/`.
  - Local static check for `/assets/images/UndergroundSunBackGround.webp` returned `content-type: image/webp` and `content-length: 983822`.
- Lighthouse comparison:
  - Baseline production `/cv`: performance `49`, LCP `13499 ms`, CLS `0.49`.
  - Local optimized `/cv` with deferred API background only: performance `70`, LCP `14277 ms`, CLS `0.02`; this proved CLS was fixed but the 14 MB background still hurt LCP.
  - Local optimized `/cv` with WebP background: performance `82`, accessibility `88`, best practices `96`, SEO `100`, FCP `1513 ms`, LCP `2251 ms`, TBT `0 ms`, CLS `0.02`, TTFB `578 ms`.
  - Lighthouse CLI generated JSON reports but exited with code `1` after report creation due to the known Windows `%TEMP%\lighthouse.*` cleanup `EPERM` issue.
- Tests: `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 27 SUCCESS`.

## 2026-06-19 01:22 Central Time - Book and websites media performance optimization

- Production baseline before this change:
  - `/book`: Lighthouse desktop performance `52`, accessibility `87`, best practices `96`, SEO `100`, FCP `822 ms`, LCP `2577 ms`, TBT `7 ms`, CLS `1.72`, TTFB `3426 ms`.
  - `/webs`: Lighthouse desktop performance `79`, accessibility `87`, best practices `96`, SEO `100`, FCP `784 ms`, LCP `3110 ms`, TBT `0 ms`, CLS `0.04`, TTFB `1208 ms`.
- `/book` root issue: image cards depended on runtime image measurement, responsive column classes, and a 15 second shuffle interval. That made SSR layout unstable and caused large layout shift.
- `/book` fix:
  - Replaced runtime column sizing with a component-local CSS grid and fixed square media boxes.
  - Removed browser-only resize measurement and periodic shuffling.
  - Rewrote media URLs from the old S3 origin to `https://assets.lynxpardelle.com` when API metadata includes `location`.
  - Kept the API `get-file` route only as a fallback when file metadata has no direct location.
  - Marked the first image as eager/high priority and later images as lazy/auto.
- `/webs` fix:
  - Rewrote desktop/tablet/mobile screenshot URLs to `https://assets.lynxpardelle.com` when API metadata includes the old S3 location.
  - Kept `get-file` only as a fallback.
  - Marked the first website image set as eager/high priority and later sets as lazy/auto.
- Local SSR smoke through the host-rewrite proxy confirmed `/book` and `/webs` returned SSR HTML with `assets.lynxpardelle.com`, no `/api/main/get-file/`, one high-priority image, and lazy images.
- Local Lighthouse comparison:
  - `/book` optimized local: performance `79`, accessibility `87`, best practices `96`, SEO `100`, FCP `1151 ms`, LCP `3043 ms`, TBT `18 ms`, CLS `0.06`, TTFB `586 ms`.
  - `/webs` optimized local: performance `78`, accessibility `87`, best practices `96`, SEO `100`, FCP `1185 ms`, LCP `3286 ms`, TBT `0 ms`, CLS `0.04`, TTFB `641 ms`.
  - `/webs` performance was neutral locally, but the change still reduces API media proxy dependence.
  - Lighthouse CLI generated JSON reports but exited with code `1` after report creation due to the known Windows `%TEMP%\lighthouse.*` cleanup `EPERM` issue.
- Focused validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/core/components/book/book.component.spec.ts --include=src/app/core/components/websites/websites.component.spec.ts` exited 0 with `TOTAL: 8 SUCCESS`.
  - `npm run build` exited 0.
- Full validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 33 SUCCESS`.
  - `npm run build` exited 0; `book-component` lazy chunk was `14.66 kB` raw / `4.07 kB` estimated transfer and `websites-component` lazy chunk was `27.83 kB` raw / `6.18 kB` estimated transfer.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `git diff --check` exited 0; it only reported expected Windows LF-to-CRLF working-copy warnings.

## 2026-06-19 04:06 Central Time - Assets CDN-only runtime media URLs

- User clarified that runtime media should no longer construct legacy API file endpoints because portfolio media is served from `https://assets.lynxpardelle.com`.
- Added shared `assetUrl(file)` utility:
  - Prefers `file.cdnUrl` when present.
  - Rewrites old `https://lynx-portfolio.s3.us-east-1.amazonaws.com` locations to `https://assets.lynxpardelle.com`.
  - Returns an empty string when CDN/location metadata is missing instead of inventing an API file URL from an id.
- Updated runtime media bindings in:
  - Global layout/background/header/audio footer.
  - Inicio admin previews.
  - Music songs, share links, album art, song cover art, and audio previews.
  - Demoreel video sources.
  - CV, Book, and Websites media helpers.
  - Blog article section media bindings, using CDN metadata only.
- `rg` verification found no runtime `get-file` references under `src/app`; remaining matches were historical notes in `Codex.md`.
- Focused validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/shared/utils/asset-url.spec.ts --include=src/app/blog/components/article-sections/article-sections.component.spec.ts --include=src/app/app.component.spec.ts --include=src/app/core/components/inicio/inicio.component.spec.ts --include=src/app/core/components/music/music.component.spec.ts --include=src/app/core/components/demoreel/demoreel.component.spec.ts --include=src/app/core/components/book/book.component.spec.ts --include=src/app/core/components/websites/websites.component.spec.ts --include=src/app/core/components/cv/cv.component.spec.ts` exited 0 with `TOTAL: 26 SUCCESS`.
- Full validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 45 SUCCESS`.
  - `npm run build` exited 0; initial browser bundle total was `1.08 MB` raw / `260.45 kB` estimated transfer.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `git diff --check` exited 0; it only reported expected Windows LF-to-CRLF working-copy warnings.

## 2026-06-19 04:53 Central Time - Final frontend polish after production audit

- Parallel audit agents reviewed the post-cutover production frontend:
  - Data/media audit found no public API media objects missing both `cdnUrl` and `location`, no `get-file` strings in public API JSON, and 77 non-blocking legacy S3 `location` strings that also have `cdnUrl`.
  - Production SSR/visual audit found `/`, `/book`, `/webs`, `/cv`, `/music`, `/reel`, and `/blog` returning HTTP 200 in desktop and mobile Chrome with no blank routes and no `get-file` network requests.
  - Ops/security audit confirmed PR #7, SSR artifacts, and infra deploys were green for release `e78fca9e1d88e35841d48a109be951ce7de809b0`.
- Implemented small non-destructive polish fixes on `work/frontend-final-polish`:
  - `AppComponent` now catches expected `NotAllowedError` audio autoplay promise rejections instead of leaving uncaught promise noise in production consoles.
  - Global `<main>` now reserves bottom padding for the fixed footer/audio controls using `padding-bottom: calc(7rem + env(safe-area-inset-bottom))`.
  - `GenericButtonComponent` now calls `NgxAngoraService.updateClasses()` only when filtered `ank-` tokens exist, avoiding empty/no-op Angora updates.
  - `AppComponent` unit tests mock `NgxAngoraService` so unit setup no longer emits Angora diagnostics unrelated to component behavior.
- TDD evidence:
  - App focused red run failed as expected with `TOTAL: 2 FAILED, 2 SUCCESS` for missing autoplay catch and bottom clearance.
  - Generic button focused red run failed as expected with `TOTAL: 1 FAILED, 1 SUCCESS` for no-Angora token update behavior.
- Validation passed:
  - `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/app.component.spec.ts` exited 0 with `TOTAL: 4 SUCCESS`.
  - `npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/shared/components/generic-button/generic-button.component.spec.ts` exited 0 with `TOTAL: 3 SUCCESS`.
  - `npm test -- --watch=false --browsers=ChromeHeadless` exited 0 with `TOTAL: 49 SUCCESS`.
  - `npm run build` exited 0; initial browser bundle total was `1.08 MB` raw / `260.62 kB` estimated transfer.
  - `npm audit --omit=dev` exited 0 with `found 0 vulnerabilities`.
  - `git diff --check` exited 0; it only reported expected Windows LF-to-CRLF working-copy warnings.
- Residual non-blocking console debt:
  - Full test output can still include existing `WebService.consoleLog` lines and occasional Ngx Angora diagnostics from components using real Angora services in tests.
  - The production visual audit classified remaining media cancellations as non-blocking because direct CDN `HEAD` checks returned HTTP 200 for the WAV and MP4 assets.
