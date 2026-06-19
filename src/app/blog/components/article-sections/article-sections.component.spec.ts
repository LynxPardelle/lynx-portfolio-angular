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
});
