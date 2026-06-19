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
