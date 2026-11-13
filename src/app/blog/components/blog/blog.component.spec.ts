import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';

import { BlogComponent } from './blog.component';
import { environment } from '../../../../environments/environment';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let httpTesting: HttpTestingController;
  let routeParams: BehaviorSubject<{ page?: string }>;
  const articlesUrl = `${environment.api}/article/articles/1/5/-create_at/all/all`;

  beforeEach(async () => {
    routeParams = new BehaviorSubject<{ page?: string }>({});
    await TestBed.configureTestingModule({
      imports: [BlogComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
        { provide: ActivatedRoute, useValue: { params: routeParams } },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    httpTesting.expectOne(articlesUrl).flush({
      status: 'success',
      total_items: 0,
      pages: 0,
      articles: [],
    });

    expect(component).toBeTruthy();
  });

  it('renders the empty blog state when the API returns no articles', () => {
    fixture.detectChanges();
    httpTesting.expectOne(articlesUrl).flush({
      status: 'success',
      total_items: 0,
      pages: 0,
      articles: [],
    });
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.articles).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No hay artículos.');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando...');
    expect(fixture.nativeElement.querySelector('blog-assistant')).toBeNull();
  });

  it('links each card to its published article and shows its title', () => {
    fixture.detectChanges();
    httpTesting.expectOne(articlesUrl).flush({ articles: [{ _id: 'editorial-aws', title: 'Migración AWS', urltitle: 'aws' }] });
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('article a');
    expect(fixture.nativeElement.querySelector('blog-assistant')).not.toBeNull();
    expect(link.textContent).toContain('Migración AWS');
    expect(link.getAttribute('href')).toBe('/blog/article/aws');
  });

  it('treats the legacy empty-articles 404 as an empty blog state', () => {
    fixture.detectChanges();
    httpTesting.expectOne(articlesUrl).flush(
      {
        status: 'error',
        message: 'No hay artículos.',
      },
      {
        status: 404,
        statusText: 'Not Found',
      }
    );
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.articles).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No hay artículos.');
    expect(fixture.nativeElement.textContent).not.toContain('Cargando...');
  });

  it('stops loading and supports retry when the feed times out', fakeAsync(() => {
    fixture.detectChanges();
    const first = httpTesting.expectOne(articlesUrl);
    expect(component.loading).toBeTrue();
    expect(fixture.nativeElement.querySelector('blog-assistant')).toBeNull();
    tick(8001);
    fixture.detectChanges();
    expect(first.cancelled).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar el blog.');
    fixture.nativeElement.querySelector('.blog-state button').click();
    httpTesting.expectOne(articlesUrl).flush({ articles: [], pages: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay artículos.');
  }));

  it('hides pagination on an empty blog and offers a return when the page is out of range', () => {
    routeParams.next({ page: '5' });
    fixture.detectChanges();
    const pageUrl = articlesUrl.replace('/articles/1/', '/articles/5/');
    httpTesting.expectOne(pageUrl).flush({ articles: [], pages: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();

    routeParams.next({ page: '6' });
    httpTesting.expectOne(pageUrl.replace('/articles/5/', '/articles/6/')).flush({ articles: [], pages: 2 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay artículos en esta página.');
    expect(fixture.nativeElement.querySelector('nav a').getAttribute('href')).toBe('/blog');
  });
});
