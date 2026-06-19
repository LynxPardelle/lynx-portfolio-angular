import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { Song } from './core/models/main';
import { NgxAngoraService } from 'ngx-angora-css';

describe('AppComponent', () => {
  let ngxAngoraService: jasmine.SpyObj<NgxAngoraService>;

  beforeEach(async () => {
    ngxAngoraService = jasmine.createSpyObj<NgxAngoraService>(
      'NgxAngoraService',
      ['befysize', 'checkSheet', 'cssCreate', 'pushColors', 'pushCssNamesParsed']
    );
    (ngxAngoraService as any).values = {
      importantActive: false,
      timeBetweenReCreate: 300,
    };
    ngxAngoraService.befysize.and.callFake((value: string) => value);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        provideMockStore({
          initialState: { main: { loading: false }, sesion: { active: false } },
        }),
        provideTranslateService(),
        { provide: NgxAngoraService, useValue: ngxAngoraService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('does not generate API file URLs when media location is missing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.assetUrl({ _id: 'file-id' })).toBe('');
  });

  it('handles browser autoplay play() rejections without console.error noise', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    let rejectionHandler: ((reason: unknown) => void) | undefined;
    const playResult = {
      catch: jasmine.createSpy('catch').and.callFake((handler) => {
        rejectionHandler = handler;
        return Promise.resolve();
      }),
    } as unknown as Promise<void>;
    const audio = {
      pause: jasmine.createSpy('pause'),
      play: jasmine.createSpy('play').and.returnValue(playResult),
      paused: true,
    };
    spyOn(window as any, 'Audio').and.returnValue(audio);
    const consoleError = spyOn(console, 'error');

    app.playAudio(
      new Song(
        'song-id',
        'Song title',
        {
          location:
            'https://lynx-portfolio.s3.us-east-1.amazonaws.com/audio/song.mp3',
        },
        0,
        null,
        '',
        1
      )
    );
    rejectionHandler?.(new DOMException('Autoplay blocked', 'NotAllowedError'));

    expect(audio.play).toHaveBeenCalled();
    expect(playResult.catch).toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('reserves bottom space for fixed footer controls', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    const paddingBottom = Number.parseFloat(
      window.getComputedStyle(main).paddingBottom
    );

    expect(paddingBottom).toBeGreaterThanOrEqual(112);
  });
});
