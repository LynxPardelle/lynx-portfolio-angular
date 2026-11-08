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
    data: { view: 'cv' },
    title: 'CV · Alec Montaño',
    loadComponent: () => import('./core/components/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
  },
  ...['projects', 'aws', 'genai'].map((view) => ({
    path: view === 'projects' ? 'proyectos' : `proyectos/${view}`,
    data: { view },
    title: 'Proyectos · Lynx Pardelle',
    loadComponent: () => import('./core/components/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
  })),
  {
    path: 'blog/article/:id',
    loadComponent: () => import('./blog/components/reader/blog-reader.component').then((m) => m.BlogReaderComponent),
  },
  ...['blog', 'blog/:page'].map((path) => ({
    path,
    loadComponent: () =>
      import('./blog/components/blog/blog.component').then(
        (m) => m.BlogComponent
      ),
  })),
  {
    path: 'admin',
    loadComponent: () => import('./auth/admin-shell.component').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'blog' },
      {
        path: 'blog',
        title: 'Editor del blog · Lynx Pardelle',
        loadComponent: () => import('./blog/components/editorial/editorial.component').then((m) => m.EditorialComponent),
      },
      {
        path: 'settings',
        title: 'Administración · Lynx Pardelle',
        loadComponent: () => import('./auth/admin-settings.component').then((m) => m.AdminSettings),
      },
    ],
  },
  {
    path: 'auth',
    pathMatch: 'full',
    redirectTo: 'admin',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./core/components/error/error.component').then(
        (m) => m.ErrorComponent
      ),
  },
];
