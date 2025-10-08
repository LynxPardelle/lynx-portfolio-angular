import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

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
app.get('*', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        // If Angular app doesn't handle the route, serve index.csr.html for client-side routing
        res.sendFile(join(browserDistFolder, 'index.csr.html'));
      }
    })
    .catch((error) => {
      console.error('Angular SSR Error:', error);
      // Fallback to serving index.csr.html for client-side routing
      res.sendFile(join(browserDistFolder, 'index.csr.html'));
    });
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
