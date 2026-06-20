import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WebService } from './web.service';

describe('WebService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('keeps diagnostic console output disabled by default', () => {
    const service = TestBed.inject(WebService);
    const consoleTrace = spyOn(console, 'trace');
    const consoleLog = spyOn(console, 'log');
    const consoleDir = spyOn(console, 'dir');

    service.consoleLog('Render again', 'app.component.ts 45');

    expect(consoleTrace).not.toHaveBeenCalled();
    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleDir).not.toHaveBeenCalled();
  });
});
