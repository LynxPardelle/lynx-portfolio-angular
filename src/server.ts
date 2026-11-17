import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { portfolioRoute } from './app/core/discovery/public-discovery';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('/{*splat}', async (req, res) => {
  const spanishAlias = req.path === '/es' || req.path.startsWith('/es/');
  const path = spanishAlias ? req.path.slice(3) || '/' : req.path;
  const page = portfolioRoute(path);
  if ((page.kind === 'public' || page.kind === 'article') && req.path !== page.canonicalPath) {
    const start = req.originalUrl.indexOf('?');
    const query = start < 0 ? '' : req.originalUrl.slice(start);
    res.redirect(308, page.canonicalPath + query);
    return;
  }

  try {
    const response = await angularApp.handle(req);
    if (!response) {
      res.set('X-Robots-Tag', 'noindex, nofollow');
      res.status(404).sendFile(join(browserDistFolder, 'index.csr.html'));
      return;
    }
    const status = page.kind === 'missing' && response.status === 200 ? 404 : response.status;
    if (page.kind === 'private' || status >= 400) {
      const headers = new Headers(response.headers);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      writeResponseToNodeResponse(new Response(response.body, { status, headers }), res);
      return;
    }
    writeResponseToNodeResponse(response, res);
  } catch (error) {
    console.error('Angular SSR Error:', error);
    res.set('X-Robots-Tag', 'noindex, nofollow');
    res.status(500).sendFile(join(browserDistFolder, 'index.csr.html'));
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PROD_PORT` or `PORT` environment variable, or defaults based on NODE_ENV.
 */
if (isMainModule(import.meta.url)) {
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const port = process.env['PROD_PORT'] || process.env['PORT'] || (isDevelopment ? 6161 : 6162);
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port} (${isDevelopment ? 'development' : 'production'} mode)`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
