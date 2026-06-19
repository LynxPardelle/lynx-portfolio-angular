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
});
