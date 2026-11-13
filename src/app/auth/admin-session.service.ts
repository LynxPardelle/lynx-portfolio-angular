import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginConfig { domain: string; clientId: string }
export interface EditorialPolicy { streak: number; auto: boolean }
type Role = 'admin' | 'editor';
type AdminApiPath = `${'editorial' | 'admin'}/${string}`;
const api = environment.api;
const callback = '/admin/blog';
export const pkceKey = 'portfolio.editorial.pkce';

@Injectable({ providedIn: 'root' })
export class AdminSession {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly currentRole = signal<Role | null>(null);
  readonly role = this.currentRole.asReadonly();
  private config?: LoginConfig;
  private accessToken = '';

  async login(destination: string) {
    const config = await this.getConfig();
    const state = this.randomKey();
    const verifier = this.randomKey();
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(hash))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    sessionStorage.setItem(pkceKey, JSON.stringify({ state, verifier, destination }));
    const query = new URLSearchParams({ response_type: 'code', client_id: config.clientId, scope: 'openid',
      redirect_uri: this.redirectUri(), state, code_challenge_method: 'S256', code_challenge: challenge });
    location.assign(`${config.domain}/oauth2/authorize?${query}`);
  }

  async completeLogin(params: URLSearchParams) {
    const stored = sessionStorage.getItem(pkceKey);
    sessionStorage.removeItem(pkceKey);
    const saved = JSON.parse(stored || 'null');
    const code = params.get('code');
    if (!saved || !code || !saved.verifier || saved.state !== params.get('state')) {
      throw new Error('La sesión de acceso no coincide. Intenta iniciar sesión de nuevo.');
    }
    const config = await this.getConfig();
    const form = new URLSearchParams({ grant_type: 'authorization_code', client_id: config.clientId,
      redirect_uri: this.redirectUri(), code, code_verifier: saved.verifier });
    const { access_token } = await firstValueFrom(this.http.post<{ access_token: string }>(
      `${config.domain}/oauth2/token`, form.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    ).pipe(timeout(15000)));
    const role = this.readRole(access_token);
    if (!role) throw new Error('Tu cuenta requiere el grupo editor o admin.');
    this.accessToken = access_token;
    this.currentRole.set(role);
    const destination = typeof saved.destination === 'string' ? saved.destination : '';
    return destination === '/blog' || /^\/admin(?:\/[a-z0-9-]+)*$/.test(destination) ? destination : callback;
  }

  logout() {
    this.clear();
    if (!this.config) return;
    const query = new URLSearchParams({ client_id: this.config.clientId, logout_uri: this.redirectUri() });
    location.assign(`${this.config.domain}/logout?${query}`);
  }

  async request<T>(method: string, path: AdminApiPath, body?: unknown) {
    try {
      return await firstValueFrom(this.http.request<T>(method, `${api}/${path}`, {
        body, headers: { Authorization: `Bearer ${this.accessToken}` },
      }).pipe(timeout(25000)));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) this.clear();
      throw error;
    }
  }

  private clear() {
    this.accessToken = '';
    this.currentRole.set(null);
  }

  private readRole(token: string): Role | null {
    const payload = token.split('.')[1];
    const claims = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')));
    const groups = claims['cognito:groups'];
    if (claims.token_use !== 'access' || !Array.isArray(groups)) return null;
    if (groups.includes('admin')) return 'admin';
    return groups.includes('editor') ? 'editor' : null;
  }

  private async getConfig() {
    this.config ??= await firstValueFrom(this.http.get<LoginConfig>(`${api}/editorial/config`).pipe(timeout(10000)));
    return this.config;
  }

  private redirectUri() { return `${location.origin}${callback}`; }

  private randomKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
