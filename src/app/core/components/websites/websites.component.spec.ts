import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';

import { WebsitesComponent } from './websites.component';

describe('WebsitesComponent', () => {
  let component: WebsitesComponent;
  let fixture: ComponentFixture<WebsitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsitesComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
        importProvidersFrom(ModalModule),
        provideTranslateService(),
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('distinguishes a failed request from an empty list and retries successfully', async () => {
    const http = TestBed.inject(HttpTestingController);
    const endpoint = (url: string) => url.endsWith('/api/main/web-sites');
    const initial = http.expectOne((request) => endpoint(request.url));
    expect(fixture.nativeElement.textContent).toContain('Cargando…');
    initial.flush({}, { status: 503, statusText: 'Service unavailable' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los sitios web.');
    expect(fixture.nativeElement.textContent).not.toContain('Todavía no hay sitios web.');

    fixture.nativeElement.querySelector('portfolio-content-status button').click();
    http.expectOne((request) => endpoint(request.url)).flush({ websites: [] });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Todavía no hay sitios web.');
    expect(fixture.nativeElement.querySelector('portfolio-content-status button')).toBeNull();
  });

  it('rewrites S3-backed website media URLs to the public assets CDN', () => {
    const url = component.mediaUrl({
      _id: 'file-id',
      location:
        'https://lynx-portfolio.s3.us-east-1.amazonaws.com/uploads/main/website-image.jpg',
    });

    expect(url).toBe(
      'https://assets.lynxpardelle.com/uploads/main/website-image.jpg'
    );
  });

  it('does not generate API file URLs when website media location is missing', () => {
    expect(component.mediaUrl({ _id: 'file-id' })).toBe('');
  });

  it('prioritizes only the first visible website image group', () => {
    expect(component.websiteImageLoading(0)).toBe('eager');
    expect(component.websiteImageFetchPriority(0)).toBe('high');
    expect(component.websiteImageLoading(1)).toBe('lazy');
    expect(component.websiteImageFetchPriority(1)).toBe('auto');
  });
});
