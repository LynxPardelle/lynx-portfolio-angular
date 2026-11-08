import { afterNextRender, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminSession } from './admin-session.service';

@Component({
  selector: 'admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="admin">
      <header class="portfolio-surface admin-heading">
        <p class="portfolio-kicker">Lynx Pardelle</p>
        <h1>Administración del portafolio</h1>
        <a routerLink="/">Volver al sitio</a>
      </header>
      <p role="status">{{ message() }}</p>
      @if (session.role()) {
        <nav aria-label="Administración">
          <a class="portfolio-btn portfolio-btn-secondary" routerLinkActive="active" routerLink="/admin/blog">Editor del blog</a>
          @if (session.role() === 'admin') {
            <a class="portfolio-btn portfolio-btn-secondary" routerLinkActive="active" routerLink="/admin/content">Contenido del sitio</a>
            <a class="portfolio-btn portfolio-btn-secondary" routerLinkActive="active" routerLink="/admin/settings">Configuración</a>
          }
          <button class="portfolio-btn portfolio-btn-secondary" type="button" (click)="session.logout()">Cerrar sesión</button>
        </nav>
        <router-outlet />
      } @else {
        <button class="portfolio-btn" type="button" [disabled]="busy()" (click)="login()">Iniciar sesión</button>
      }
    </section>
  `,
  styles: `
    .admin { width: min(72rem, calc(100% - 2rem)); margin: 3rem auto; color: var(--portfolio-text); }
    .admin-heading { padding-block: 1.5rem; }
    nav { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-block: 1rem; }
  `,
})
export class AdminShell {
  private readonly router = inject(Router);
  protected readonly session = inject(AdminSession);
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  constructor() {
    afterNextRender(() => {
      const params = new URLSearchParams(location.search);
      if (!params.has('code') && !params.has('error')) return;
      history.replaceState(history.state, '', location.pathname);
      void this.run(async () => {
        const destination = await this.session.completeLogin(params);
        await this.router.navigateByUrl(destination, { replaceUrl: true });
      });
    });
  }

  protected login() { return this.run(() => this.session.login(this.router.url.split(/[?#]/)[0])); }

  private async run(task: () => Promise<void>) {
    this.busy.set(true);
    this.message.set('');
    try { await task(); }
    catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally { this.busy.set(false); }
  }
}
