import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GenericButtonComponent } from '../generic-button/generic-button.component';
import { GenericDropdownComponent } from '../generic-dropdown/generic-dropdown.component';
import { GenericInputComponent } from './generic-input.component';
import { HarshifyPipe } from '../../pipes/harshify.pipe';

describe('GenericInputComponent', () => {
  let component: GenericInputComponent;
  let fixture: ComponentFixture<GenericInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenericInputComponent],
      imports: [
        CommonModule,
        FormsModule,
        GenericButtonComponent,
        GenericDropdownComponent,
      ],
      providers: [HarshifyPipe, provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericInputComponent);
    component = fixture.componentInstance;
    component.type = 'text';
    component.thing = 'value';
    component.thingFather = { value: '' };
    component.buttons = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
