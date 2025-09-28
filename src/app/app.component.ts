import {
  Component,
  DoCheck,
  OnInit,
  HostListener,
  afterNextRender,
  afterRender,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
/* RXJS */
import { lastValueFrom, Observable } from 'rxjs';
/* Environment */
import { environment } from 'src/environments/environment';
/* Services */
import { MainService } from './core/services/main.service';
import { WebService } from './shared/services/web.service';
import { SharedService } from './shared/services/shared.service';
import { NgxBootstrapExpandedFeaturesService as BefService } from 'ngx-bootstrap-expanded-features';
/* Models */
import { Main, Song } from './core/models/main';
/* Interfaces */
import { IMain } from './core/interfaces/main';
/* Extras */
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
/* NGX-Bootstrap */
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
/* State */
import { Store } from '@ngrx/store';
import { AppState } from './state/app.state';
import { MainMainSelector } from './state/selectors/main.selector';
import { LoadMain } from './state/actions/main.actions';
/*
 */
import { IdentitySelector } from './state/selectors/sesion.selector';
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    TranslatePipe,
    TooltipModule,
    BsDropdownModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true },
    },
  ],
})
export class AppComponent implements OnInit, DoCheck {
  public identity: any;
  public main!: Main;
  public songs: Song[] = [];
  public currentSong: Song = new Song('', '', null, 0, null, '', 0);
  public bgDefaultClasses: string[] = [];
  /* Translate */
  public lang: string = 'es';
  /* Urls */
  public urlMain: string = environment.api + '/main/';
  /* Console Settings */
  public document: string = 'app.component.ts';
  public customConsoleCSS =
    'background-color: green; color: white; padding: 1em;';
  /* BEF */
  public colors: any = {
    fullRed: '#FF5555',
    midRed: '#DD5555',
    fullYellow: '#f9c24f',
    fullGreen: '#55FF55',
    facebook: '#0a58ca',
    whatsApp: '#48C02D',
    twitter: '#1C9BEA',
    gmail: '#CF4B3B',
    linkedIn: '#2465AA',
    udark: '#050505',
    tdark: '#000000',
    ulight: '#f5f5f5',
    tlight: '#ffffff',
    transparent: 'rgba(0,0,0,0)',
  };
  public customCssNamesParsed: { [key: string]: string | string[] } = {
    sqr: ['width', 'height'],
    alIte: 'align-items',
    jusCont: 'justify-content',
    flDir: 'flex-direction',
    verAli: 'vertical-align',
    uSel: 'user-select',
    bor: 'border',
    lh: 'line-height',
    trnsf: 'transform',
    trnsion: 'transition',
    cur: 'cursor',
    fw: 'font-weight',
    whtSp: 'white-space',
    out: 'outline',
    pnt: 'pointer-events',
    ani: 'animation',
  };
  /* Utility */
  public windowWidth = 0;
  public copiedToClipBoard: string = '';
  public currentAudio: any;
  /* State */
  public main$: Observable<IMain | undefined>;
  public identity$: Observable<any | undefined>;
  constructor(
    private _mainService: MainService,
    private _befService: BefService,
    private _translate: TranslateService,
    private _webService: WebService,
    private _location: Location,
    private _sharedService: SharedService,
    private store: Store<AppState>
  ) {
    _sharedService.changeEmitted$.subscribe((sharedContent: any) => {
      if (
        typeof sharedContent === 'object' &&
        sharedContent.from !== 'app' &&
        (sharedContent.to === 'app' || sharedContent.to === 'all')
      ) {
        switch (sharedContent.property) {
          case 'lang':
            this.lang = sharedContent.thing;
            break;
          case 'windowWidth':
            this.windowWidth = sharedContent.thing;
            break;
          case 'copiedToClipBoard':
            this.copiedToClipBoard = sharedContent.thing;
            break;
          case 'play':
            this.playAudio(sharedContent.thing);
            break;
          case 'pause':
            this.pause();
            break;
          case 'checkForCurrentSong':
            this.checkForCurrentSong();
            break;
          case 'onlyConsoleMessage':
            this._webService.consoleLog(
              sharedContent.thing,
              this.document + ' 45',
              this.customConsoleCSS
            );
            break;
        }
      }
    });
    this.main$ = store.select(MainMainSelector);
    this.identity$ = store.select(IdentitySelector);

    if (typeof window !== 'undefined') {
      this._translate.addLangs(['es', 'en']);
      this._translate.setDefaultLang(this.lang);
      this.lang =
        this._translate.getBrowserLang() &&
        this._translate.getBrowserLang() !== undefined &&
        this._translate.getBrowserLang()!.match(/en|es/)
          ? this._translate.getBrowserLang()!
          : this.lang;
    }

    // Identity
    this.identity = this._mainService.getIdentity();
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });

    this.getSongs();

    if (typeof window !== 'undefined') {
      let lang = localStorage.getItem('lang');
      this.lang = lang !== null && typeof lang === 'string' ? lang : this.lang;
      this._translate.use(this.lang);
      this._sharedService.emitChange({
        from: 'app',
        to: 'all',
        property: 'lang',
        thing: this.lang,
      });
    }

    this.store.dispatch(LoadMain());
    afterNextRender(() => {
      this._befService.checkSheet();
      this._befService.values.importantActive = true;
      this._befService.pushColors(this.colors);
      this._befService.pushCssNamesParsed(this.customCssNamesParsed);
      // this._befService.changeDebugOption();
      this.cssCreate();
    });

    afterRender(() => {
      this.cssCreate();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = event.target.innerWidth;
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'windowWidth',
      thing: this.windowWidth,
    });
  }

  ngOnInit(): void {
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'onlyConsoleMessage',
      thing: 'Data from app',
    });
    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
    }
    this.getMain();
    this.getIdentity();
    this.bgDefaultClasses = [
      'position-fixed top-0 start-0 bef bef-w-100vw bef-h-100vh bef-z-MIN20 bef-backgroundColor-abyss bef-mixBlendMode-hue',
      'bef-backgroundImage-' +
        this.befysize(
          'url("' +
            environment.url +
            '/assets/images/image5DarkForest90deg.jpg")'
        ) +
        ' position-fixed top-0 start-0 bef bef-w-100vw bef-h-100vh bef-backgroundSize-cover bef-o-0_5 bef-mixBlendMode-lighten bef-z-MIN15 bef-backgroundPosition-center__center bef-backgroundRepeat-noMINrepeat',
      'bef-backgroundImage-' +
        this.befysize(
          'url("' +
            environment.url +
            '/assets/images/image5DarkForest90deg.jpg")'
        ) +
        ' position-fixed top-0 start-0 bef bef-w-100vw bef-h-100vh bef-backgroundSize-cover bef-o-0_5 bef-mixBlendMode-lighten bef-z-MIN10 bef-backgroundPosition-center__center bef-backgroundRepeat-noMINrepeat bef-transform-scaleXSDMIN1ED',
      'position-fixed top-0 start-0 bef bef-w-100vw bef-h-100vh bef-backgroundColor-HASHDD5555 bef-mixBlendMode-hue bef-z-MIN5',
    ];
  }

  ngDoCheck(): void {
    this.identity = this._mainService.getIdentity();
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'main',
      thing: this.main,
    });

    if (typeof window !== 'undefined') {
      let lang = localStorage.getItem('lang');
      this.lang = lang !== null && typeof lang === 'string' ? lang : this.lang;
      this._translate.use(this.lang);

      this._sharedService.emitChange({
        from: 'app',
        to: 'all',
        property: 'lang',
        thing: this.lang,
      });
    }
  }

  /* State */
  getMain() {
    this.main$.subscribe({
      next: (m) => {
        if (m !== undefined) {
          this.main = m;
        }
      },
      error: (e) => console.error(e),
    });
  }
  getIdentity() {
    this.identity$.subscribe({
      next: (i) => {
        if (i !== undefined) {
          this.identity = i;
        }
      },
      error: (e) => console.error(e),
    });
  }
  async getSongs() {
    try {
      let songs = await lastValueFrom(this._mainService.getSongs());

      if (!songs || !songs.songs) {
        throw new Error('There is no songs.');
      }

      this.songs = songs.songs;

      this.playAudio(this.songs[0]);
      this.pause();
    } catch (err) {
      console.error(err);
    }
  }

  changeLang(lang: string) {
    if (typeof window !== 'undefined') {
      this.lang = lang;
      this._translate.use(lang);

      localStorage.setItem('lang', this.lang);
      this._sharedService.emitChange({
        from: 'app',
        to: 'all',
        property: 'lang',
        thing: this.lang,
      });
    }
  }

  copyToClipBoard(copyText: string) {
    navigator.clipboard.writeText(copyText);
    this.copiedToClipBoard = '';
    this.copiedToClipBoard = copyText;
    this._sharedService.emitChange({
      from: 'music',
      to: 'all',
      property: 'copiedToClipBoard',
      thing: this.copiedToClipBoard,
    });
  }

  playAudio(newSong: Song) {
    if (this.currentSong !== newSong) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.currentSong = newSong;
      this._sharedService.emitChange({
        from: 'app',
        to: 'music',
        property: 'currentSong',
        thing: this.currentSong,
      });
      if (
        this.currentSong &&
        this.currentSong.song &&
        this.currentSong.song.location &&
        this.currentSong.song.location !== ''
      ) {
        this.currentAudio = new Audio(
          this.urlMain + 'get-file/' + this.currentSong.song._id
        );
        this.currentAudio.play();
        this._sharedService.emitChange({
          from: 'app',
          to: 'music',
          property: 'currentAudio',
          thing: this.currentAudio,
        });
      } else {
        this.currentAudio = null;
        this._sharedService.emitChange({
          from: 'app',
          to: 'music',
          property: 'currentAudio',
          thing: this.currentAudio,
        });
      }
    } else {
      this.currentAudio.play();
      this._sharedService.emitChange({
        from: 'app',
        to: 'music',
        property: 'currentAudio',
        thing: this.currentAudio,
      });
    }
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this._sharedService.emitChange({
        from: 'app',
        to: 'music',
        property: 'currentAudio',
        thing: this.currentAudio,
      });
    }
  }

  checkForCurrentSong() {
    if (this.currentSong._id !== '') {
      this._sharedService.emitChange({
        from: 'app',
        to: 'music',
        property: 'currentSong',
        thing: this.currentSong,
      });
      this._sharedService.emitChange({
        from: 'app',
        to: 'music',
        property: 'currentAudio',
        thing: this.currentAudio,
      });
    }
  }
  /*
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ILP');
      localStorage.removeItem('>');
    }
    this.identity = null;
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });

    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  backClicked() {
    this._location.back();
  }

  befysize(string: string) {
    return this._befService.befysize(string);
  }

  cssCreate() {
    if (typeof window !== 'undefined') {
      this._befService.cssCreate();
    }
  }
}
