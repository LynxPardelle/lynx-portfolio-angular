import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap, timeout } from 'rxjs';
import { ArticleTerm, IArticle, IArticleSection, taxonomyLabel, TaxonomyKind } from '../../interfaces/blog';
import { BlogService } from '../../services/blog.service';
import { ContentStatusComponent } from '../../../shared/components/content-status/content-status.component';

type ReaderState = { status: 'ready'; article: (IArticle & { sections: IArticleSection[] }) | null }
  | { status: 'loading' | 'error'; article: null };
const loading: ReaderState = { status: 'loading', article: null };

@Component({
  selector: 'blog-reader',
  imports: [RouterLink, ContentStatusComponent],
  template: `
    <article class="portfolio-surface">
      <a class="portfolio-btn portfolio-btn-secondary" routerLink="/blog">Blog</a>
      @if (state().article; as item) {
        <h1>{{ english ? (item.titleEng || item.title) : item.title }}</h1>
        @if (item.taxonomy?.length) {
          <dl class="taxonomy">
            @for (group of groups; track group.kind) {
              @if ((item.taxonomy || []).some(group.matches)) {
                <dt>{{ english ? group.en : group.es }}</dt>
                <dd>
                  @for (term of item.taxonomy || []; track term.kind + ':' + term.key) {
                    @if (term.kind === group.kind) {
                      <a class="portfolio-btn portfolio-btn-secondary" routerLink="/blog"
                        [queryParams]="filterParams(term)">{{ label(term, english) }}</a>
                    }
                  }
                </dd>
              }
            }
          </dl>
        }
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
      } @else {
        <portfolio-content-status [status]="state().status" [empty]="true" [english]="english"
          [emptyText]="english ? 'Article not found.' : 'No se encontró el artículo.'"
          [errorText]="english ? 'Could not load the article.' : 'No se pudo cargar el artículo.'"
          (retry)="reload()" />
      }
    </article>
  `,
  styles: [`article { width: min(54rem, calc(100% - 2rem)); margin: 3rem auto; overflow-wrap: anywhere; } a { color: var(--portfolio-accent-hover); } h1 { margin-block: 1rem; }
    .taxonomy { margin-block: 1.25rem; } .taxonomy dd { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .35rem; }
    .taxonomy a { min-block-size: 2.25rem; padding: .2rem .65rem; }`],
})
export class BlogReaderComponent {
  protected readonly label = taxonomyLabel;
  protected readonly groups = [
    { kind: 'category', es: 'Categoría', en: 'Category' },
    { kind: 'subcategory', es: 'Subcategorías', en: 'Subcategories' },
    { kind: 'tag', es: 'Etiquetas', en: 'Tags' },
  ].map((group) => ({ ...group, matches: (term: { kind: TaxonomyKind }) => term.kind === group.kind }));
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);
  private readonly translate = inject(TranslateService);
  private readonly retry = new Subject<void>();
  protected readonly state = toSignal(combineLatest([this.route.paramMap, this.retry.pipe(startWith(undefined))]).pipe(switchMap(([params]) =>
    this.blog.getArticle(encodeURIComponent(params.get('id') || '')).pipe(
      timeout(8000),
      map((result): ReaderState => {
        if (!result?.article) throw new Error('Invalid article response.');
        return { status: 'ready', article: result.article };
      }),
      catchError((error) => of<ReaderState>({
        status: error instanceof HttpErrorResponse && error.status === 404 ? 'ready' : 'error', article: null,
      })),
      startWith(loading),
    )),
  ), { initialValue: loading });

  protected get english() { return this.translate.getCurrentLang() === 'en'; }
  protected filterParams(term: ArticleTerm) { return { [term.kind]: term.key }; }
  protected reload() { this.retry.next(); }
}
