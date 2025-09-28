import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Bootstrap function that properly handles Angular 19 SSR context
const bootstrap = () => {
  // For development, we provide a context object to satisfy the SSR requirements
  return bootstrapApplication(AppComponent, {
    ...config,
    providers: [
      ...config.providers
    ]
  });
};

export default bootstrap;
