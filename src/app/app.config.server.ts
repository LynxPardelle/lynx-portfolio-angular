import { provideServerRendering, withRoutes } from '@angular/ssr';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Server-side configuration for Angular SSR.
 * Keep this server-only so the client router/providers from appConfig are not
 * registered twice, which can make SSR finish before route content is rendered.
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
