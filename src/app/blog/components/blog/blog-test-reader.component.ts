import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { AdminSession } from '../../../auth/admin-session.service';

interface TestArticle {
  slug: string;
  title: string;
  titleEng: string;
  category: string;
  tags: string[];
  subcategories: string[];
}

interface TestDetail extends TestArticle { html: string; htmlEng: string }

@Component({
  selector: 'blog-test-reader',
  template: `
    @if (session.role() === 'admin') {
      <button class="portfolio-btn portfolio-btn-secondary" type="button" [disabled]="busy()"
        [attr.aria-expanded]="expanded()" aria-controls="test-articles" (click)="toggle()">
        {{ english() ? 'Test articles' : 'Artículos de prueba' }}
      </button>
      <section id="test-articles" [hidden]="!expanded()">
        <h2>{{ english() ? 'Private previews' : 'Vistas previas privadas' }}</h2>
        @if (busy()) { <p role="status">{{ english() ? 'Loading…' : 'Cargando…' }}</p> }
        @if (error()) { <p role="alert">{{ error() }}</p> }
        @if (error() && !articles()) {
          <button class="portfolio-btn portfolio-btn-secondary" type="button" (click)="loadArticles()">
            {{ english() ? 'Try again' : 'Reintentar' }}
          </button>
        }
        @if (articles(); as items) {
          <ul>
            @for (item of items; track item.slug) {
              <li>
                <button class="portfolio-btn portfolio-btn-secondary" type="button"
                  [class.active]="article()?.slug === item.slug" [disabled]="busy()" (click)="open(item.slug)">
                  {{ english() ? item.titleEng : item.title }}
                </button>
              </li>
            } @empty {
              <li>{{ english() ? 'There are no test articles.' : 'No hay artículos de prueba.' }}</li>
            }
          </ul>
        }
        @if (article(); as item) {
          <article>
            <h3>{{ english() ? item.titleEng : item.title }}</h3>
            <p class="taxonomy">{{ taxonomy(item) }}</p>
            <div [innerHTML]="english() ? item.htmlEng : item.html"></div>
          </article>
        }
      </section>
    } @else if (!session.role()) {
      <button class="portfolio-btn portfolio-btn-secondary" type="button" [disabled]="busy()" (click)="login()">
        {{ english() ? 'Editorial sign-in' : 'Acceso editorial' }}
      </button>
      @if (error()) { <p role="alert">{{ error() }}</p> }
    }
  `,
  styles: `
    section { margin-block-start: 1rem; padding: 1.25rem; border: 1px solid var(--portfolio-line); border-radius: .65rem; }
    section[hidden] { display: none; }
    ul { display: flex; flex-wrap: wrap; gap: .5rem; list-style: none; padding: 0; }
    article { padding-block-start: 1rem; border-block-start: 1px solid var(--portfolio-line); overflow-wrap: anywhere; }
    .taxonomy { color: var(--portfolio-muted); }
  `,
})
export class BlogTestReader {
  protected readonly session = inject(AdminSession);
  readonly english = input(false);
  protected readonly expanded = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly articles = signal<TestArticle[] | null>(null);
  protected readonly article = signal<TestDetail | null>(null);

  protected toggle() {
    this.expanded.update((visible) => !visible);
    if (!this.expanded()) {
      this.articles.set(null);
      this.article.set(null);
      return;
    }
    return this.loadArticles();
  }

  protected loadArticles() {
    return this.run(async () => {
      const result = await this.session.request<{ articles: TestArticle[] }>('GET', 'editorial/test-articles');
      this.articles.set(result.articles);
    });
  }

  protected open(slug: string) {
    this.article.set(null);
    return this.run(async () => {
      const result = await this.session.request<{ article: TestDetail }>('GET', `editorial/test-articles/${encodeURIComponent(slug)}`);
      this.article.set(result.article);
    });
  }

  protected login() { return this.run(() => this.session.login('/blog')); }

  protected taxonomy(item: TestArticle) {
    return [item.category, ...item.subcategories, ...item.tags].join(' · ');
  }

  private async run(action: () => Promise<void>) {
    this.busy.set(true);
    this.error.set('');
    try { await action(); }
    catch (error) {
      this.error.set(error instanceof HttpErrorResponse && error.status === 404
        ? (this.english() ? 'Test article not found.' : 'No se encontró el artículo de prueba.')
        : (this.english() ? 'Could not complete the request.' : 'No se pudo completar la solicitud.'));
    }
    finally { this.busy.set(false); }
  }
}
