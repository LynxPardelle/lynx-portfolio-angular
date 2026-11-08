import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AdminSession, pkceKey } from './admin-session.service';
import { environment } from '../../environments/environment';

describe('AdminSession', () => {
  let session: AdminSession;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    session = TestBed.inject(AdminSession);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    sessionStorage.removeItem(pkceKey);
    http.verify();
  });

  it('exchanges a single callback and uses its access token for both administration and editorial requests', fakeAsync(() => {
    sessionStorage.setItem(pkceKey, JSON.stringify({ state: 'nonce', verifier: 'secret', destination: '/admin/settings' }));
    let destination: string | undefined;
    void session.completeLogin(new URLSearchParams('code=code&state=nonce')).then((path) => destination = path);
    http.expectOne(`${environment.api}/editorial/config`).flush({ domain: 'https://cognito.example', clientId: 'client' });
    flushMicrotasks();
    const token = `header.${btoa(JSON.stringify({ token_use: 'access', 'cognito:groups': ['admin', 'editor'] }))}.signature`;
    const exchange = http.expectOne('https://cognito.example/oauth2/token');
    expect(new URLSearchParams(exchange.request.body).get('code_verifier')).toBe('secret');
    exchange.flush({ access_token: token });

    flushMicrotasks();
    expect(destination).toBe('/admin/settings');
    expect(session.role()).toBe('admin');
    for (const resource of ['editorial/drafts', 'editorial/settings', 'admin/example'] as const) {
      void session.request('GET', resource);
      const request = http.expectOne(`${environment.api}/${resource}`);
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      request.flush({});
      flushMicrotasks();
    }
  }));

  it('rejects an invalid callback before making requests', async () => {
    sessionStorage.setItem(pkceKey, JSON.stringify({ state: 'correct', verifier: 'secret' }));
    await expectAsync(session.completeLogin(new URLSearchParams('code=code&state=wrong'))).toBeRejected();
    expect(session.role()).toBeNull();
    expect(sessionStorage.getItem(pkceKey)).toBeNull();
  });
});
