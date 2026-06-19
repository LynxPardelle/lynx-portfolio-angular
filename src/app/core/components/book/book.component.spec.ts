import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { ModalModule } from 'ngx-bootstrap/modal';

import { BookComponent } from './book.component';

describe('BookComponent', () => {
  let component: BookComponent;
  let fixture: ComponentFixture<BookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
        importProvidersFrom(ModalModule),
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rewrites S3-backed media URLs to the public assets CDN', () => {
    const url = component.mediaUrl({
      _id: 'file-id',
      location:
        'https://lynx-portfolio.s3.us-east-1.amazonaws.com/uploads/main/book-image.jpg',
    });

    expect(url).toBe(
      'https://assets.lynxpardelle.com/uploads/main/book-image.jpg'
    );
  });

  it('does not generate API file URLs when media location is missing', () => {
    expect(component.mediaUrl({ _id: 'file-id' })).toBe('');
  });

  it('prioritizes only the first visible book image', () => {
    expect(component.bookImageLoading(0)).toBe('eager');
    expect(component.bookImageFetchPriority(0)).toBe('high');
    expect(component.bookImageLoading(1)).toBe('lazy');
    expect(component.bookImageFetchPriority(1)).toBe('auto');
  });
});
