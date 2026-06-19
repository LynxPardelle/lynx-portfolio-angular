import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
        provideHttpClient(),
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

  it('falls back to the API file endpoint when website media location is missing', () => {
    expect(component.mediaUrl({ _id: 'file-id' })).toBe(
      `${component.urlMain()}get-file/file-id`
    );
  });

  it('prioritizes only the first visible website image group', () => {
    expect(component.websiteImageLoading(0)).toBe('eager');
    expect(component.websiteImageFetchPriority(0)).toBe('high');
    expect(component.websiteImageLoading(1)).toBe('lazy');
    expect(component.websiteImageFetchPriority(1)).toBe('auto');
  });
});
