import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/components/inicio/inicio.component').then(
        (m) => m.InicioComponent
      ),
  },
  {
    path: 'webs',
    loadComponent: () =>
      import('./core/components/websites/websites.component').then(
        (m) => m.WebsitesComponent
      ),
  },
  {
    path: 'reel',
    loadComponent: () =>
      import('./core/components/demoreel/demoreel.component').then(
        (m) => m.DemoreelComponent
      ),
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./core/components/book/book.component').then(
        (m) => m.BookComponent
      ),
  },
  {
    path: 'music',
    loadComponent: () =>
      import('./core/components/music/music.component').then(
        (m) => m.MusicComponent
      ),
  },
  {
    path: 'cv',
    loadComponent: () =>
      import('./core/components/cv/cv.component').then((m) => m.CvComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./blog/components/blog/blog.component').then(
        (m) => m.BlogComponent
      ),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/error/error.component').then(
        (m) => m.ErrorComponent
      ),
  },
];
