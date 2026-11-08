import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import english from '../../../public/assets/i18n/en.json';
import spanish from '../../../public/assets/i18n/es.json';
import { LoadMain } from '../state/actions/main.actions';
import { AdminSession } from './admin-session.service';

type Value = string | number | null;
type Field = [key: string, label: string, kind: 'text' | 'long' | 'url' | 'embed' | 'number' | 'media'];
interface Collection { label: string; fields: Field[] }
interface RecordEntry { id: string; version: number; values: Record<string, Value> }
interface Media { id: string; title: string; type?: string }

const publicRoutes: Record<string, string> = {
  mains: '/', websites: '/webs', bookimgs: '/book', videos: '/reel', albums: '/music', songs: '/music',
};
const profileDefaults: Record<string, string> = {
  profileHeadline: spanish['portfolio.headline'], profileHeadlineEng: english['portfolio.headline'],
  profileSummary: spanish['portfolio.summary'], profileSummaryEng: english['portfolio.summary'],
  awsIntro: spanish['portfolio.aws.intro'], awsIntroEng: english['portfolio.aws.intro'],
  genaiIntro: spanish['portfolio.genai.intro'], genaiIntroEng: english['portfolio.genai.intro'],
};
const normalize = (value: Value | undefined) => value === '' ? null : value ?? null;

@Component({
  selector: 'admin-content',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.scss',
})
export class AdminContent {
  protected readonly session = inject(AdminSession);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);
  private readonly pending = signal(0);
  private loadId = 0;
  private baseline: Record<string, Value> = {};
  protected readonly sections = signal<[string, Collection][]>([]);
  protected readonly media = signal<Media[]>([]);
  protected readonly selected = signal('mains');
  protected readonly definition = computed(() => this.sections().find(([key]) => key === this.selected())?.[1]);
  protected readonly pageLink = computed(() => publicRoutes[this.selected()] || '/');
  protected readonly records = signal<RecordEntry[]>([]);
  protected readonly active = signal<RecordEntry | null>(null);
  protected readonly editing = signal(false);
  protected readonly busy = computed(() => this.pending() > 0);
  protected readonly confirmDelete = signal(false);
  protected readonly message = signal('');
  protected values: Record<string, Value> = {};

  constructor() {
    afterNextRender(() => {
      if (this.session.role() === 'admin') void this.initialize();
    });
  }

  protected open(record: RecordEntry | null) {
    this.active.set(record);
    this.baseline = { ...record?.values };
    if (record && this.selected() === 'mains') {
      for (const [key] of this.definition()?.fields || []) {
        if (Object.hasOwn(profileDefaults, key) && !this.baseline[key]) {
          this.baseline[key] = profileDefaults[key];
        }
      }
    }
    this.values = { ...this.baseline };
    this.editing.set(true);
    this.confirmDelete.set(false);
    this.message.set('');
  }

  protected label(record: RecordEntry) {
    return record.values['title'] || record.values['titleEng'] || this.definition()?.label || record.id;
  }

  protected missingMedia(value: Value) {
    return typeof value === 'string' && value !== '' && !this.media().some((file) => file.id === value);
  }

  protected save() {
    const current = this.active();
    const collection = this.selected();
    const values = Object.fromEntries(Object.entries(this.values)
      .map(([key, value]) => [key, normalize(value)] as const)
      .filter(([key, value]) => value !== normalize(this.baseline[key])));
    if (!Object.keys(values).length) { this.message.set('Cambia al menos un campo antes de guardar.'); return; }
    return this.run(async () => {
      const saved = current
        ? await this.session.request<RecordEntry>('PUT', `admin/content/${collection}/${current.id}`, { values, version: current.version })
        : await this.session.request<RecordEntry>('POST', `admin/content/${collection}`, { values });
      if (collection === 'mains') this.store.dispatch(LoadMain());
      if (this.selected() !== collection) return;
      await this.load(collection, saved.id);
      this.message.set('Cambios guardados en el sitio.');
    });
  }

  protected remove() {
    const current = this.active();
    if (!current) return;
    const collection = this.selected();
    return this.run(async () => {
      await this.session.request('DELETE', `admin/content/${collection}/${current.id}`, { version: current.version });
      if (this.selected() !== collection) return;
      await this.load(collection);
      this.message.set('Registro eliminado.');
    });
  }

  private async initialize() {
    await this.run(async () => {
      const { collections } = await this.session.request<{ collections: Record<string, Collection> }>('GET', 'admin/content');
      this.sections.set(Object.entries(collections));
    });
    if (!this.sections().length) return;
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const requested = params.get('collection') || 'mains';
      const collection = this.sections().some(([key]) => key === requested) ? requested : 'mains';
      this.selected.set(collection);
      this.records.set([]);
      this.editing.set(false);
      void this.run(() => this.load(collection));
    });
    try {
      this.media.set((await this.session.request<{ files: Media[] }>('GET', 'admin/media')).files);
    } catch {
      this.message.set('No se pudo cargar la biblioteca de archivos. Puedes editar los demás campos.');
    }
  }

  private async load(collection: string, activeId?: string) {
    const loadId = ++this.loadId;
    const { records } = await this.session.request<{ records: RecordEntry[] }>('GET', `admin/content/${collection}`);
    if (loadId !== this.loadId || this.selected() !== collection) return;
    this.records.set(records);
    this.editing.set(false);
    const selected = activeId ? records.find((record) => record.id === activeId) : records[0];
    if (selected) this.open(selected);
  }

  private async run(action: () => Promise<void>) {
    this.pending.update((count) => count + 1);
    this.message.set('');
    try { await action(); }
    catch (error) {
      this.message.set(error instanceof HttpErrorResponse && error.error?.error
        ? error.error.error : 'No fue posible completar la operación.');
    } finally { this.pending.update((count) => count - 1); }
  }
}
