import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
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

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor]), withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    
    // State Management (NgRx)
    provideStore(ROOT_REDUCERS),
    provideEffects([MainEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'LynxPortfolio'
    }),
    
    // Third-party modules as providers
    importProvidersFrom(
      // NGX-Translate
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
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
