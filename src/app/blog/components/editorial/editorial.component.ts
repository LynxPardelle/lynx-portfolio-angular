import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, timeout } from 'rxjs';
import { AdminSession } from '../../../auth/admin-session.service';
import { BlogService } from '../../services/blog.service';

interface Draft {
  slug: string;
  category: 'technology' | 'art' | 'other' | 'test';
  subcategories?: string[];
  tags?: string[];
  eventDate: string;
  sources: string[];
  es?: { title: string; markdown: string };
  en?: { title: string; markdown: string };
  origin?: string;
  status?: string;
  version: number;
}

const emptyDraft = (): Draft => ({ slug: '', category: 'other', eventDate: '', sources: [], version: 0 });

@Component({
  selector: 'editorial-page',
  imports: [FormsModule],
  templateUrl: './editorial.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './editorial.component.scss',
})
export class EditorialComponent {
  protected readonly session = inject(AdminSession);
  private readonly blog = inject(BlogService);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly drafts = signal<Draft[]>([]);
  protected readonly draftsLoaded = signal(false);
  protected readonly publishedAvailable = signal(false);
  protected readonly preview = signal('');
  protected readonly beta = signal('');
  protected readonly confirmDelete = signal(false);
  protected question = '';
  protected betaLang = 'es';
  protected draft = emptyDraft();
  protected titleEs = '';
  protected titleEn = '';
  protected markdownEs = '';
  protected markdownEn = '';
  protected sourceText = '';
  protected tagText = '';
  protected subcategoryText = '';
  protected previewLang: 'es' | 'en' = 'es';

  constructor() {
    afterNextRender(() => {
      void this.loadDrafts();
      void this.checkPublishedArticles();
    });
  }

  protected loadDrafts() {
    return this.run(async () => {
      await this.refresh();
      const [latest] = this.drafts();
      if (latest) this.open(latest);
    });
  }

  protected open(draft = emptyDraft()) {
    this.draft = { ...draft };
    this.titleEs = draft.es?.title || '';
    this.titleEn = draft.en?.title || '';
    this.markdownEs = draft.es?.markdown || '';
    this.markdownEn = draft.en?.markdown || '';
    this.sourceText = (draft.sources || []).join('\n');
    this.tagText = (draft.tags || []).join(', ');
    this.subcategoryText = (draft.subcategories || []).join(', ');
    this.preview.set('');
    this.confirmDelete.set(false);
  }

  protected isPrivate(draft: Draft) {
    return draft.category === 'test' || (draft.tags || []).some((tag) => ['test', 'prueba'].includes(tag));
  }

  protected get editingPrivate() {
    return this.isPrivate({ ...this.draft, tags: this.labels(this.tagText) });
  }

  protected get canPreview() {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.draft.slug) &&
      (!!this.titleEs.trim() && !!this.markdownEs.trim() || !!this.titleEn.trim() && !!this.markdownEn.trim());
  }

  protected save() {
    return this.run(async () => {
      const updated = await this.session.request<Draft>('PUT', `editorial/drafts/${encodeURIComponent(this.draft.slug)}`, this.payload());
      this.open(updated);
      await this.refresh();
      void this.checkPublishedArticles();
      this.message.set('Borrador guardado.');
    });
  }

  protected review() {
    return this.run(async () => {
      const result = await this.session.request<Record<'es' | 'en', string>>('POST', 'editorial/preview', this.payload());
      this.preview.set(result[this.previewLang]);
    });
  }

  protected action(action: 'publish' | 'withdraw' | 'reject') {
    return this.run(async () => {
      this.open(await this.session.request<Draft>('POST', `editorial/drafts/${encodeURIComponent(this.draft.slug)}/${action}`, { version: this.draft.version }));
      await this.refresh();
      void this.checkPublishedArticles();
      this.message.set('Estado actualizado.');
    });
  }

  protected remove() {
    return this.run(async () => {
      await this.session.request('DELETE', `editorial/drafts/${encodeURIComponent(this.draft.slug)}`, { version: this.draft.version });
      this.open();
      await this.refresh();
      void this.checkPublishedArticles();
      this.message.set('Artículo eliminado.');
    });
  }

  protected askBeta() {
    return this.run(async () => {
      this.beta.set('');
      const result = await this.session.request<{ answer: string }>('POST', 'editorial/assistant', { question: this.question, lang: this.betaLang });
      this.beta.set(result.answer);
    });
  }

  private payload(): Draft {
    return { ...this.draft, sources: this.sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      tags: this.labels(this.tagText), subcategories: this.labels(this.subcategoryText),
      es: this.titleEs || this.markdownEs ? { title: this.titleEs, markdown: this.markdownEs } : undefined,
      en: this.titleEn || this.markdownEn ? { title: this.titleEn, markdown: this.markdownEn } : undefined };
  }

  private labels(value: string) {
    return value.toLowerCase().split(/[,\s]+/).filter(Boolean);
  }

  private async refresh() {
    const result = await this.session.request<{ drafts: Draft[] }>('GET', 'editorial/drafts');
    this.drafts.set(result.drafts);
    this.draftsLoaded.set(true);
  }

  private async checkPublishedArticles() {
    try {
      const result = await firstValueFrom(this.blog.getArticles(1, 1, '-create_at', 'all', 'all', undefined).pipe(timeout(8000)));
      this.publishedAvailable.set(Array.isArray(result?.articles) && result.articles.length > 0);
    } catch {
      this.publishedAvailable.set(false);
    }
  }

  private async run(task: () => Promise<void>) {
    this.busy.set(true);
    this.message.set('');
    try { await task(); }
    catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.message.set(error.error?.error || 'No fue posible completar la operación.');
      } else { this.message.set(error instanceof Error ? error.message : 'Error editorial.'); }
    } finally { this.busy.set(false); }
  }
}
