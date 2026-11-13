import { afterNextRender, Component, inject, signal } from '@angular/core';
import { AdminSession, EditorialPolicy } from './admin-session.service';

@Component({
  selector: 'admin-settings',
  template: `
    <section class="studio portfolio-surface">
      <h2>Configuración del blog</h2>
      @if (session.role() === 'admin') {
        @if (policy(); as current) {
          <p>Aprobaciones consecutivas de Desktop · {{ current.streak }}</p>
          <button class="portfolio-btn" type="button" [disabled]="busy() || (!current.auto && current.streak < 6)" (click)="toggle(current)">
            {{ current.auto ? 'Pausar' : 'Activar' }} publicación automática
          </button>
        }
        @if (!policy() && !busy() && message()) {
          <button class="portfolio-btn portfolio-btn-secondary" type="button" (click)="load('GET')">Reintentar</button>
        }
        @if (busy()) { <p role="status">{{ policy() ? 'Guardando configuración…' : 'Cargando configuración…' }}</p> }
        <p role="status">{{ message() }}</p>
      } @else {
        <p>Esta sección requiere el rol de administrador.</p>
      }
    </section>
  `,
  styleUrl: '../blog/components/editorial/editorial.component.scss',
})
export class AdminSettings {
  protected readonly session = inject(AdminSession);
  protected readonly policy = signal<EditorialPolicy | null>(null);
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  constructor() {
    afterNextRender(() => {
      if (this.session.role() === 'admin') void this.load('GET');
    });
  }

  protected toggle(policy: EditorialPolicy) { return this.load('PUT', { auto: !policy.auto }); }

  protected async load(method: 'GET' | 'PUT', body?: { auto: boolean }) {
    this.busy.set(true);
    this.message.set('');
    try {
      this.policy.set(await this.session.request<EditorialPolicy>(method, 'editorial/settings', body));
      if (method === 'PUT') this.message.set('Configuración guardada.');
    } catch {
      this.message.set('No fue posible acceder a la configuración.');
    } finally { this.busy.set(false); }
  }
}
