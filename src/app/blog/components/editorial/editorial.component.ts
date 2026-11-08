import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSession } from '../../../auth/admin-session.service';

interface Draft {
  slug: string;
  category: 'technology' | 'art' | 'other';
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
  private readonly session = inject(AdminSession);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly drafts = signal<Draft[]>([]);
  protected readonly preview = signal('');
  protected readonly beta = signal('');
  protected question = '';
  protected betaLang = 'es';
  protected draft = emptyDraft();
  protected titleEs = '';
  protected titleEn = '';
  protected markdownEs = '';
  protected markdownEn = '';
  protected sourceText = '';
  protected previewLang: 'es' | 'en' = 'es';

  constructor() {
    afterNextRender(() => void this.run(() => this.refresh()));
  }

  protected open(draft = emptyDraft()) {
    this.draft = { ...draft };
    this.titleEs = draft.es?.title || '';
    this.titleEn = draft.en?.title || '';
    this.markdownEs = draft.es?.markdown || '';
    this.markdownEn = draft.en?.markdown || '';
    this.sourceText = draft.sources.join('\n');
    this.preview.set('');
  }

  protected save() {
    return this.run(async () => {
      const updated = await this.session.request<Draft>('PUT', `drafts/${encodeURIComponent(this.draft.slug)}`, this.payload());
      this.open(updated);
      await this.refresh();
      this.message.set('Borrador guardado.');
    });
  }

  protected review() {
    return this.run(async () => {
      const result = await this.session.request<Record<'es' | 'en', string>>('POST', 'preview', this.payload());
      this.preview.set(result[this.previewLang]);
    });
  }

  protected action(action: 'publish' | 'withdraw' | 'reject') {
    return this.run(async () => {
      this.open(await this.session.request<Draft>('POST', `drafts/${encodeURIComponent(this.draft.slug)}/${action}`, { version: this.draft.version }));
      await this.refresh();
      this.message.set('Estado actualizado.');
    });
  }

  protected askBeta() {
    return this.run(async () => {
      this.beta.set('');
      const result = await this.session.request<{ answer: string }>('POST', 'assistant', { question: this.question, lang: this.betaLang });
      this.beta.set(result.answer);
    });
  }

  private payload(): Draft {
    return { ...this.draft, sources: this.sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      es: this.titleEs || this.markdownEs ? { title: this.titleEs, markdown: this.markdownEs } : undefined,
      en: this.titleEn || this.markdownEn ? { title: this.titleEn, markdown: this.markdownEn } : undefined };
  }

  private async refresh() {
    const result = await this.session.request<{ drafts: Draft[] }>('GET', 'drafts');
    this.drafts.set(result.drafts);
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
