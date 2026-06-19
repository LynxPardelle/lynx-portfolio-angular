import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { ModalModule } from 'ngx-bootstrap/modal';

import { DemoreelComponent } from './demoreel.component';

describe('DemoreelComponent', () => {
  let component: DemoreelComponent;
  let fixture: ComponentFixture<DemoreelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoreelComponent],
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
    fixture = TestBed.createComponent(DemoreelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
