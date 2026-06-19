import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { ModalModule } from 'ngx-bootstrap/modal';

import { CvComponent } from './cv.component';

describe('CvComponent', () => {
  let component: CvComponent;
  let fixture: ComponentFixture<CvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvComponent],
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
    fixture = TestBed.createComponent(CvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rewrites S3-backed media URLs to the public assets CDN', () => {
    expect(
      component.mediaUrl({
        location:
          'https://lynx-portfolio.s3.us-east-1.amazonaws.com/uploads/main/cv.png',
      })
    ).toBe('https://assets.lynxpardelle.com/uploads/main/cv.png');
  });

  it('does not generate API file URLs when media location is missing', () => {
    expect(component.mediaUrl({ _id: 'file-id' })).toBe('');
  });
});
