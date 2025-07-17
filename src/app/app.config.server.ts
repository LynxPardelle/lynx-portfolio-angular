import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

/**
 * Server-side configuration for Angular Universal SSR
 * Merges client-side config with server-specific providers
 * 
 * This configuration enables:
 * - Server-side rendering (SSR)
 * - Hydration for better performance
 * - Server-specific HTTP handling
 * - State transfer for seamless client-server transition
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    
    // Server-specific providers can be added here:
    // - Custom server-only services
    // - Server-specific interceptors
    // - Platform-specific implementations
    // - State transfer mechanisms
    
    // Example: Server-only logging or analytics
    // provideServerLogger(),
    
    // Example: Server-specific error handling
    // provideServerErrorHandler(),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
