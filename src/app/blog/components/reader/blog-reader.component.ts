import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, timeout } from 'rxjs';
import { IArticle, IArticleSection } from '../../interfaces/blog';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'blog-reader',
  imports: [RouterLink],
  template: `
    <article class="portfolio-surface">
      <a class="portfolio-btn portfolio-btn-secondary" routerLink="/blog">Blog</a>
      @if (article(); as item) {
        <h1>{{ english ? (item.titleEng || item.title) : item.title }}</h1>
        @if (item.editorial?.origin === 'desktop') { <p>{{ english ? 'Written with AI assistance' : 'Redactado con asistencia de IA' }}</p> }
        <div [innerHTML]="english ? item.introEng : item.intro"></div>
        @for (section of item.sections; track section._id) {
          <h2>{{ english ? section.titleEng : section.title }}</h2>
          <div [innerHTML]="english ? section.textEng : section.text"></div>
        }
        <div [innerHTML]="english ? item.outroEng : item.outro"></div>
        @if (item.editorial?.sources?.length) {
          <h2>{{ english ? 'Sources' : 'Fuentes' }}</h2>
          <ul>@for (source of item.editorial?.sources || []; track source) { <li><a [href]="source" rel="noopener noreferrer">{{ source }}</a></li> }</ul>
        }
      } @else if (article() === null) {
        <h1>{{ english ? 'Article unavailable' : 'Artículo no disponible' }}</h1>
      } @else {
        <p>{{ english ? 'Loading…' : 'Cargando…' }}</p>
      }
    </article>
  `,
  styles: [`article { width: min(54rem, calc(100% - 2rem)); margin: 3rem auto; overflow-wrap: anywhere; } a { color: var(--portfolio-accent-hover); } h1 { margin-block: 1rem; }`],
})
export class BlogReaderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);
  private readonly translate = inject(TranslateService);
  protected readonly article = toSignal(this.route.paramMap.pipe(switchMap((params) =>
    this.blog.getArticle(encodeURIComponent(params.get('id') || '')).pipe(
      timeout(8000),
      map((result) => result.article as IArticle & { sections: IArticleSection[] }),
      catchError(() => of(null)),
    )),
  ));

  protected get english() { return this.translate.getCurrentLang() === 'en'; }
}
