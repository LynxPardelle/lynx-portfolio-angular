import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericButtonComponent } from './generic-button.component';
import { HarshifyPipe } from '../../pipes/harshify.pipe';

describe('GenericButtonComponent', () => {
  let component: GenericButtonComponent;
  let fixture: ComponentFixture<GenericButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericButtonComponent],
      providers: [HarshifyPipe],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
