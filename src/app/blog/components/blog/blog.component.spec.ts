import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { BlogComponent } from './blog.component';
import { environment } from '../../../../environments/environment';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let httpTesting: HttpTestingController;
  const articlesUrl = `${environment.api}/article/articles/1/5/-create_at/all/all`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
        { provide: ActivatedRoute, useValue: { params: of({}) } },
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
  });

  it('links each card to its published article and shows its title', () => {
    fixture.detectChanges();
    httpTesting.expectOne(articlesUrl).flush({ articles: [{ _id: 'editorial-aws', title: 'Migración AWS', urltitle: 'aws' }] });
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('article a');
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
});
