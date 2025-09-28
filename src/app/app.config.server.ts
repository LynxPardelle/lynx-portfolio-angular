import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withPreloading, PreloadAllModules, NoPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServerRendering } from '@angular/platform-server';

// State Management (NgRx)
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

// NGX-Translate
import { importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// Third-party libraries
import { NgxUploaderModule } from '@angular-ex/uploader';
import { MomentModule } from 'ngx-moment';
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

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Server-side configuration for Angular Universal SSR
 * This configuration replicates the client config but excludes
 * client-specific providers that cause conflicts during SSR prerendering
 */
export const config: ApplicationConfig = {
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
    provideServerRendering(),
    
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
    
    // Third-party modules as providers
    importProvidersFrom(
      // NGX-Translate with optimizations
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        isolate: false,
        useDefaultLang: true,
        defaultLanguage: 'en',
      }),
      
      // Third-party libraries
      NgxUploaderModule,
      MomentModule.forRoot({
        relativeTimeThresholdOptions: {
          m: 59,
        },
      }),
      YouTubePlayerModule,
      
      // NGX-Bootstrap modules
      BsDropdownModule.forRoot(),
      AccordionModule.forRoot(),
      ModalModule.forRoot(),
      TooltipModule.forRoot(),
      CarouselModule.forRoot()
    )
  ]
};
