import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Bootstrap function that properly handles Angular 19 SSR context
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
