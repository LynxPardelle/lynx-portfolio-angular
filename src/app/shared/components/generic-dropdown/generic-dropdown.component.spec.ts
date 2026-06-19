import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GenericDropdownComponent } from './generic-dropdown.component';
import { HarshifyPipe } from '../../pipes/harshify.pipe';

describe('GenericDropdownComponent', () => {
  let component: GenericDropdownComponent;
  let fixture: ComponentFixture<GenericDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDropdownComponent],
      providers: [HarshifyPipe, provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
