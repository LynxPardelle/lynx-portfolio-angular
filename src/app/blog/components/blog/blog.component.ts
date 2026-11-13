import { DatePipe, isPlatformServer } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, DestroyRef, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap, timeout } from 'rxjs';
import { IArticle } from '../../interfaces/blog';
import { BlogService } from '../../services/blog.service';
import { BlogAssistantComponent } from '../assistant/blog-assistant.component';
import { BlogTestReader } from './blog-test-reader.component';

interface Feed {
  status: 'loading' | 'ready' | 'error';
  articles: IArticle[];
  page: number;
  pages: number;
}

const empty: Feed = { status: 'ready', articles: [], page: 1, pages: 0 };
const feedKey = makeStateKey<Feed>('portfolio-blog-feed');

@Component({
  selector: 'blog',
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
  imports: [DatePipe, BlogAssistantComponent, BlogTestReader, RouterLink],
})
export class BlogComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);
  private readonly translate = inject(TranslateService, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly transfer = inject(TransferState);
  private readonly server = isPlatformServer(inject(PLATFORM_ID));
  private readonly retry = new Subject<void>();
  protected readonly feed = signal(this.transfer.get(feedKey, empty));

  public get articles() { return this.feed().articles; }
  public get loading() { return this.feed().status === 'loading'; }
  protected get english() { return this.translate?.getCurrentLang() === 'en'; }

  constructor() {
    afterNextRender(() => this.load());
  }

  ngOnInit() {
    if (this.server) this.load();
  }

  protected reload() { this.retry.next(); }

  private load() {
    combineLatest([this.route.params, this.retry.pipe(startWith(undefined))]).pipe(
      switchMap(([params]) => {
        const page = Math.max(1, Number(params['page']) || 1);
        const previous = this.feed();
        if (previous.page !== page || !this.transfer.hasKey(feedKey)) {
          this.feed.set({ ...empty, page, status: 'loading' });
        }
        this.transfer.remove(feedKey);
        return this.blog.getArticles(page, 5, '-create_at', 'all', 'all', undefined).pipe(
          timeout(8000),
          map((result): Feed => {
            if (!Array.isArray(result?.articles)) throw new Error('Invalid article list.');
            return { status: 'ready', page, articles: result.articles,
              pages: Number.isInteger(result.pages) && result.pages > 0 ? result.pages : 0 };
          }),
          catchError((error) => of<Feed>({
            ...empty, page, status: error instanceof HttpErrorResponse && error.status === 404 ? 'ready' : 'error',
          })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((feed) => {
      this.feed.set(feed);
      if (this.server) this.transfer.set(feedKey, feed);
    });
  }

  protected categoryLabel(category: string): string {
    if (category === 'technology') return this.english ? 'Technology' : 'Tecnología';
    if (category === 'art') return this.english ? 'Art' : 'Arte';
    return this.english ? 'Other' : 'Otros';
  }
}
