import { Component, effect, inject, RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, combineLatest, filter, map, of, startWith, Subject, switchMap, timeout } from 'rxjs';
import { ArticleTerm, IArticle, IArticleSection, taxonomyLabel, TaxonomyKind } from '../../interfaces/blog';
import { PortfolioDiscovery } from '../../../core/discovery/portfolio-discovery.service';
import { portfolioPath, portfolioRoute } from '../../../core/discovery/public-discovery';
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
      <a class="portfolio-btn portfolio-btn-secondary" [routerLink]="publicHref('/blog')">Blog</a>
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
                      <a class="portfolio-btn portfolio-btn-secondary" [routerLink]="publicHref('/blog')"
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
  private readonly router = inject(Router);
  private readonly discovery = inject(PortfolioDiscovery);
  private readonly response = inject(RESPONSE_INIT, { optional: true });
  private readonly url = toSignal(this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects),
  ), { initialValue: this.router.url });
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

  constructor() {
    effect(() => {
      const url = this.url();
      const route = portfolioRoute(url);
      if (route.kind !== 'article') return;
      const state = this.state();
      const article = state.article;
      if (!article) {
        this.discovery.apply(url);
        if (this.response && state.status !== 'loading') this.response.status = state.status === 'ready' ? 404 : 503;
        return;
      }
      const english = route.language === 'en';
      const hasTranslation = Boolean(article.titleEng?.trim() && (article.langs?.includes('en') || article.introEng?.trim()));
      const title = english ? article.titleEng : article.title;
      if (title?.trim() && (!english || hasTranslation)) {
        const subtitle = (english ? article.subtitleEng : article.subtitle) || '';
        this.discovery.apply(url, { title: title.trim(), description: subtitle.replace(/<[^>]*>/g, '').trim(), hasTranslation });
      }
    });
  }

  protected get english() { return this.translate.getCurrentLang() === 'en'; }
  protected publicHref(path: string) { return portfolioPath(path, this.english ? 'en' : 'es'); }
  protected filterParams(term: ArticleTerm) { return { [term.kind]: term.key }; }
  protected reload() { this.retry.next(); }
}
