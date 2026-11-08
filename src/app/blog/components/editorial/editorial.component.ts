import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

interface EditorialConfig { domain: string; clientId: string }
interface EditorialPolicy { streak: number; auto: boolean }
const emptyDraft = (): Draft => ({ slug: '', category: 'other', eventDate: '', sources: [], version: 0 });
const editorApi = `${environment.api}/editorial`;
const pkceKey = 'portfolio.editorial.pkce';

@Component({
  selector: 'editorial-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './editorial.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './editorial.component.scss',
})
export class EditorialComponent {
  private readonly http = new HttpClient(inject(HttpBackend));
  private config?: EditorialConfig;
  private accessToken = '';
  protected readonly signedIn = signal(false);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly drafts = signal<Draft[]>([]);
  protected readonly policy = signal<EditorialPolicy>({ streak: 0, auto: false });
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
    afterNextRender(() => {
      const params = new URLSearchParams(location.search);
      if (params.has('code') || params.has('error')) void this.run(() => this.completeLogin(params));
    });
  }

  protected async login() {
    await this.run(async () => {
      const config = await this.getConfig();
      const state = this.randomKey();
      const verifier = this.randomKey();
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
      const challenge = btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
      sessionStorage.setItem(pkceKey, JSON.stringify({ state, verifier }));
      const query = new URLSearchParams({ response_type: 'code', client_id: config.clientId, scope: 'openid',
        redirect_uri: this.redirectUri(), state, code_challenge_method: 'S256', code_challenge: challenge });
      location.assign(`${config.domain}/oauth2/authorize?${query}`);
    });
  }

  protected logout() {
    if (!this.config) return;
    this.accessToken = '';
    this.signedIn.set(false);
    const query = new URLSearchParams({ client_id: this.config.clientId, logout_uri: this.redirectUri() });
    location.assign(`${this.config.domain}/logout?${query}`);
  }

  private async completeLogin(params: URLSearchParams) {
    const saved = JSON.parse(sessionStorage.getItem(pkceKey) || 'null');
    sessionStorage.removeItem(pkceKey);
    history.replaceState(history.state, '', '/admin/blog');
    const code = params.get('code');
    if (!saved || !code || saved.state !== params.get('state')) throw new Error('La sesión de acceso no coincide. Intenta iniciar sesión de nuevo.');
    const config = await this.getConfig();
    const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: config.clientId,
      redirect_uri: this.redirectUri(), code, code_verifier: saved.verifier });
    const token = await firstValueFrom(this.http.post<{ access_token: string }>(`${config.domain}/oauth2/token`, form.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }));
    this.accessToken = token.access_token;
    await this.refresh();
    this.signedIn.set(true);
  }

  private async getConfig() {
    this.config ??= await firstValueFrom(this.http.get<EditorialConfig>(`${editorApi}/config`));
    return this.config;
  }

  private redirectUri() { return `${location.origin}/admin/blog`; }

  private randomKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
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
      const updated = await this.send<Draft>('PUT', `drafts/${encodeURIComponent(this.draft.slug)}`, this.payload());
      this.open(updated);
      await this.refresh();
      this.message.set('Borrador guardado.');
    });
  }

  protected review() {
    return this.run(async () => {
      const result = await this.send<Record<'es' | 'en', string>>('POST', 'preview', this.payload());
      this.preview.set(result[this.previewLang]);
    });
  }

  protected action(action: 'publish' | 'withdraw' | 'reject') {
    return this.run(async () => {
      this.open(await this.send<Draft>('POST', `drafts/${encodeURIComponent(this.draft.slug)}/${action}`, { version: this.draft.version }));
      await this.refresh();
      this.message.set('Estado actualizado.');
    });
  }

  protected toggleAuto() {
    return this.run(async () => this.policy.set(await this.send<EditorialPolicy>('PUT', 'settings', { auto: !this.policy().auto })));
  }

  protected askBeta() {
    return this.run(async () => {
      this.beta.set('');
      const result = await this.send<{ answer: string }>('POST', 'assistant', { question: this.question, lang: this.betaLang });
      this.beta.set(result.answer);
    });
  }

  private payload(): Draft {
    return { ...this.draft, sources: this.sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
      es: this.titleEs || this.markdownEs ? { title: this.titleEs, markdown: this.markdownEs } : undefined,
      en: this.titleEn || this.markdownEn ? { title: this.titleEn, markdown: this.markdownEn } : undefined };
  }

  private async refresh() {
    const result = await this.send<{ drafts: Draft[]; policy: EditorialPolicy }>('GET', 'drafts');
    this.drafts.set(result.drafts);
    this.policy.set(result.policy);
  }

  private send<T>(method: string, path: string, body?: unknown) {
    return firstValueFrom(this.http.request<T>(method, `${editorApi}/${path}`, { body, headers: { Authorization: `Bearer ${this.accessToken}` } }));
  }

  private async run(task: () => Promise<void>) {
    this.busy.set(true);
    this.message.set('');
    try { await task(); }
    catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) this.signedIn.set(false);
        this.message.set(error.error?.error || 'No fue posible completar la operación.');
      } else { this.message.set(error instanceof Error ? error.message : 'Error editorial.'); }
    } finally { this.busy.set(false); }
  }
}
