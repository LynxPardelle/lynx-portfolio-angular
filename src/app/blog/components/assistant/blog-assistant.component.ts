import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Answer { answer: string; sources: { title: string; url: string }[] }

@Component({
  selector: 'blog-assistant',
  imports: [FormsModule, RouterLink],
  template: `
    @if (endpoint) {
      <section class="assistant" aria-labelledby="blog-assistant-title">
        <h2 id="blog-assistant-title">{{ english ? 'Ask the blog' : 'Pregúntale al blog' }}</h2>
        <p>{{ english ? 'Answers use published articles and include links to sources.' : 'Las respuestas consultan artículos publicados e incluyen enlaces a las fuentes.' }}</p>
        <form class="portfolio-form" (ngSubmit)="ask()">
          <label for="blog-question">{{ english ? 'Question' : 'Pregunta' }}</label>
          <input id="blog-question" name="question" [(ngModel)]="question" maxlength="400" required>
          <button class="portfolio-btn" type="submit" [disabled]="busy() || !question.trim()">{{ english ? 'Ask' : 'Consultar' }}</button>
        </form>
        <p role="status">{{ busy() ? (english ? 'Looking for sources…' : 'Buscando fuentes…') : answer() }}</p>
        @if (sources().length) {
          <ul>@for (source of sources(); track source.url) { <li><a [routerLink]="source.url">{{ source.title }}</a></li> }</ul>
        }
      </section>
    }
  `,
  styles: [`.assistant { background: var(--portfolio-field-bg); padding: clamp(1rem, 3vw, 1.5rem); border: 1px solid var(--portfolio-line); border-radius: .6rem; margin-block: 1.5rem; }
    form { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; }
    input { flex: 1; min-width: min(100%, 12rem); } a { color: var(--portfolio-accent-hover); }`],
})
export class BlogAssistantComponent {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly translate = inject(TranslateService, { optional: true });
  protected readonly endpoint = environment.assistant;
  protected readonly busy = signal(false);
  protected readonly answer = signal('');
  protected readonly sources = signal<Answer['sources']>([]);
  protected question = '';

  protected get english() { return this.translate?.getCurrentLang() === 'en'; }

  protected async ask() {
    if (!this.endpoint || this.busy() || !this.question.trim()) return;
    this.busy.set(true);
    this.answer.set('');
    this.sources.set([]);
    try {
      const payload = JSON.stringify({ question: this.question.trim(), lang: this.english ? 'en' : 'es' });
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
      const digest = Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
      const response = await firstValueFrom(this.http.post<Answer>(this.endpoint, payload, {
        headers: { 'Content-Type': 'application/json', 'x-amz-content-sha256': digest },
      }));
      this.answer.set(response.answer);
      this.sources.set(response.sources.filter((source) => /^\/blog\/article\/[a-zA-Z0-9_-]+$/.test(source.url)));
    } catch (error) {
      const text = error instanceof HttpErrorResponse ? error.error?.answer : '';
      this.answer.set(text || (this.english ? 'The assistant is temporarily unavailable.' : 'El asistente está temporalmente deshabilitado.'));
    } finally { this.busy.set(false); }
  }
}
