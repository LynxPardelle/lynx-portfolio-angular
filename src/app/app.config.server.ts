import { provideServerRendering, withRoutes } from '@angular/ssr';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection, isDevMode, mergeApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withPreloading, PreloadAllModules, NoPreloading } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideHttpClient, withInterceptors, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

// State Management (NgRx)
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

// NGX-Translate
import { importProvidersFrom } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// Third-party libraries
import { NgxUploaderModule } from '@angular-ex/uploader';
import { YouTubePlayerModule } from '@angular/youtube-player';

// NGX-Bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CarouselModule } from 'ngx-bootstrap/carousel';

// Local imports
import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { ROOT_REDUCERS } from './state/app.state';
import { MainEffects } from './state/effects/main.effects';
import { environment } from '../environments/environment';

registerLocaleData(localeEs);

/**
 * Server-side configuration for Angular Universal SSR
 * This configuration replicates the client config but excludes
 * client-specific providers that cause conflicts during SSR prerendering
 */
const serverConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers with optimizations
    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true,
    }),
    provideRouter(
      routes,
      // Router optimizations - disable blocking navigation for SSR development
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      // Preload all modules for faster navigation
      environment.production ? withPreloading(PreloadAllModules) : withPreloading(NoPreloading)
    ),
    provideHttpClient(
      withInterceptors([tokenInterceptor]), 
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideAnimations(),
    // Use server rendering instead of client hydration for SSR
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: LOCALE_ID, useValue: 'es' },
    
    // State Management (NgRx) with optimizations
    provideStore(ROOT_REDUCERS, {
      runtimeChecks: {
        strictStateImmutability: !environment.production,
        strictActionImmutability: !environment.production,
        strictStateSerializability: !environment.production,
        strictActionSerializability: !environment.production,
      },
    }),
    provideEffects([MainEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'LynxPortfolio',
      connectInZone: true,
    }),
    
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'es',
    }),
    
    // Third-party modules as providers
    importProvidersFrom(
      // Third-party libraries
      NgxUploaderModule,
      YouTubePlayerModule,
      
      // NGX-Bootstrap modules
      BsDropdownModule,
      AccordionModule,
      ModalModule,
      TooltipModule,
      CarouselModule
    )
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
