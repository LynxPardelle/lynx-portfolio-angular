import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { ArticleSectionsComponent } from './article-sections.component';

describe('ArticleSectionsComponent', () => {
  let component: ArticleSectionsComponent;
  let fixture: ComponentFixture<ArticleSectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArticleSectionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
      ],
    });
    fixture = TestBed.createComponent(ArticleSectionsComponent);
    component = fixture.componentInstance;
    component.article = { _id: '', sections: [] } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves article file URLs from assets CDN metadata', () => {
    expect(
      component.articleFileUrl({
        cdnUrl: 'https://assets.lynxpardelle.com/uploads/blog/file.webp',
        file: 'legacy-file-id',
      })
    ).toBe('https://assets.lynxpardelle.com/uploads/blog/file.webp');
  });

  it('does not generate article get-file URLs when CDN metadata is missing', () => {
    component.apiBlog = 'https://api.lynxpardelle.com/api/article/';

    expect(component.articleFileUrl({ file: 'legacy-file-id' })).toBe('');
  });
});
