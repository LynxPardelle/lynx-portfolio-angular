import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

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

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

/**
 * Complete application configuration migrated from app.module.ts
 * This includes all the providers and functionality from the original module-based setup
 * 
 * Features included:
 * - Core Angular providers (routing, HTTP, animations, SSR)
 * - Token-based HTTP interceptor
 * - NgRx state management with effects and dev tools
 * - Internationalization with NGX-Translate
 * - Third-party libraries (file uploader, moment, YouTube player)
 * - Bootstrap UI components
 * 
 * To use this configuration:
 * 1. Ensure all packages are installed (see package.json dependencies)
 * 2. Replace the content of app.config.ts with this configuration
 * 3. Remove app.config.full.ts (this is just a template)
 */
export const appConfigFull: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    
    // State Management (NgRx) - equivalent to StoreModule.forRoot() and EffectsModule.forRoot()
    provideStore(ROOT_REDUCERS),
    provideEffects([MainEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'LynxPortfolio'
    }),
    
    // Third-party modules imported as providers
    importProvidersFrom(
      // Internationalization - equivalent to TranslateModule.forRoot()
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      
      // File uploader
      NgxUploaderModule,
      
      // Date/time handling - equivalent to MomentModule.forRoot()
      MomentModule.forRoot({
        relativeTimeThresholdOptions: {
          m: 59,
        },
      }),
      
      // YouTube player integration
      YouTubePlayerModule,
      
      // Bootstrap UI components - equivalent to forRoot() calls
      BsDropdownModule.forRoot(),
      AccordionModule.forRoot(),
      ModalModule.forRoot(),
      TooltipModule.forRoot(),
      CarouselModule.forRoot()
    )
  ]
};

/*
Migration Notes:
================

Original app.module.ts structure:
- declarations: [Components] -> Now standalone components, no global declarations needed
- imports: [Modules] -> Converted to importProvidersFrom() in providers array
- providers: [Services, Interceptors] -> Migrated to modern provider functions
- bootstrap: [AppComponent] -> Handled by main.ts with bootstrapApplication()

Key Changes:
1. HTTP_INTERCEPTORS -> withInterceptors([]) with functional interceptors
2. StoreModule.forRoot() -> provideStore()
3. EffectsModule.forRoot() -> provideEffects()
4. BrowserModule -> Not needed with standalone bootstrap
5. BrowserAnimationsModule -> provideAnimations()
6. Modular imports -> importProvidersFrom() for legacy modules

Benefits of this migration:
- Tree-shakable: Only used providers are included in the bundle
- Type-safe: Better TypeScript integration
- Performance: Faster bootstrap and smaller bundle size
- Modern: Follows Angular 19 best practices
- Maintainable: Cleaner dependency management
*/
