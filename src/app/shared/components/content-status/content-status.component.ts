import { Component, input, output } from '@angular/core';

export type ContentStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'portfolio-content-status',
  template: `
    @if (status() === 'loading') {
      <p class="notice" role="status">{{ english() ? 'Loading…' : 'Cargando…' }}</p>
    } @else if (status() === 'error') {
      <div class="notice">
        <p role="alert">{{ errorText() }}</p>
        <button class="portfolio-btn portfolio-btn-secondary" type="button" (click)="retry.emit()">
          {{ english() ? 'Try again' : 'Reintentar' }}
        </button>
      </div>
    } @else if (empty()) {
      <p class="notice" role="status">{{ emptyText() }}</p>
    }
  `,
  styles: `
    .notice { width: min(40rem, calc(100% - 2rem)); margin: 1rem auto; padding: 1rem;
      background: var(--portfolio-panel); border: 1px solid var(--portfolio-line); border-radius: .65rem; }
    .notice p { margin-block: 0 .75rem; }
  `,
})
export class ContentStatusComponent {
  readonly status = input.required<ContentStatus>();
  readonly empty = input(false);
  readonly english = input(false);
  readonly emptyText = input('');
  readonly errorText = input.required<string>();
  readonly retry = output<void>();
}
