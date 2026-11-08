import { afterNextRender, Component, inject, signal } from '@angular/core';
import { AdminSession, EditorialPolicy } from './admin-session.service';

@Component({
  selector: 'admin-settings',
  template: `
    <section class="studio">
      <h2>Configuración del blog</h2>
      @if (session.role() === 'admin') {
        @if (policy(); as current) {
          <p>Aprobaciones consecutivas de Desktop · {{ current.streak }}</p>
          <button type="button" [disabled]="busy() || (!current.auto && current.streak < 6)" (click)="toggle(current)">
            {{ current.auto ? 'Pausar' : 'Activar' }} publicación automática
          </button>
        }
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

  private async load(method: 'GET' | 'PUT', body?: { auto: boolean }) {
    this.busy.set(true);
    this.message.set('');
    try {
      this.policy.set(await this.session.request<EditorialPolicy>(method, 'settings', body));
      if (method === 'PUT') this.message.set('Configuración guardada.');
    } catch {
      this.message.set('No fue posible acceder a la configuración.');
    } finally { this.busy.set(false); }
  }
}
