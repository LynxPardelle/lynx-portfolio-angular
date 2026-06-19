import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericButtonComponent } from './generic-button.component';
import { HarshifyPipe } from '../../pipes/harshify.pipe';
import { NgxAngoraService } from 'ngx-angora-css';

describe('GenericButtonComponent', () => {
  let component: GenericButtonComponent;
  let fixture: ComponentFixture<GenericButtonComponent>;
  let ngxAngoraService: jasmine.SpyObj<NgxAngoraService>;

  beforeEach(async () => {
    ngxAngoraService = jasmine.createSpyObj<NgxAngoraService>(
      'NgxAngoraService',
      ['updateClasses']
    );

    await TestBed.configureTestingModule({
      imports: [GenericButtonComponent],
      providers: [
        HarshifyPipe,
        { provide: NgxAngoraService, useValue: ngxAngoraService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not update Angora classes when classButton has no Angora tokens', () => {
    component.classButton = 'btn btn-primary';

    fixture.detectChanges();

    expect(ngxAngoraService.updateClasses).not.toHaveBeenCalled();
  });

  it('updates Angora classes when classButton has Angora tokens', () => {
    component.classButton = 'btn ank ank-bg-fullRed ank-text-tdark';

    fixture.detectChanges();

    expect(ngxAngoraService.updateClasses).toHaveBeenCalledOnceWith([
      'ank-bg-fullRed',
      'ank-text-tdark',
    ]);
  });
});
