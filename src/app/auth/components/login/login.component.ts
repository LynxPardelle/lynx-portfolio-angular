import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/* RxJs */
import { Observable } from 'rxjs';
/* Interfaces */
import { IMain } from '../../../core/interfaces/main';
/* Models */
import { User } from '../../../core/models/main';
/* Services */
import { MainService } from '../../../core/services/main.service';
import { WebService } from '../../../shared/services/web.service';
import { SharedService } from '../../../shared/services/shared.service';
/* State */
import { Store } from '@ngrx/store';
import { AppState } from '../../../state/app.state';
import { MainMainSelector } from '../../../state/selectors/main.selector';
import { LoadMain } from '../../../state/actions/main.actions';
/* Extras */
import Swal from 'sweetalert2';
import { style } from '@angular/animations';
import { SesionLoaded } from '../../../state/actions/sesion.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  public user: User = new User('', '', '', '');
  public main!: IMain;
  public identity: any;
  public token: any;

  /* Console Settings */
  public document: string = 'login.component.ts';
  public customConsoleCSS =
    'background-color: rgba(123,45,100,0.75); color: white; padding: 1em;';

  /* Utility */
  public windowWidth: number = 1200;
  /* State */
  public main$: Observable<IMain | undefined>;
  constructor(
    private _mainService: MainService,

    private _route: ActivatedRoute,
    private _router: Router,
    private _webService: WebService,
    private _sharedService: SharedService,
    private store: Store<AppState>
  ) {
    _sharedService.changeEmitted$.subscribe((sharedContent) => {
      if (
        typeof sharedContent === 'object' &&
        sharedContent.from !== 'login' &&
        (sharedContent.to === 'login' || sharedContent.to === 'all')
      ) {
        switch (sharedContent.property) {
          case 'identity':
            this.identity = sharedContent.thing;
            break;
          case 'windowWidth':
            this.windowWidth = sharedContent.thing;
            break;
          case 'onlyConsoleMessage':
            this._webService.consoleLog(
              sharedContent.thing,
              this.document + ' 51',
              this.customConsoleCSS
            );
            break;
        }
      }
    });
    this.main$ = store.select(MainMainSelector);
    /* Identity */
    this.identity = this._mainService.getIdentity();
    this._webService.consoleLog(
      this.identity,
      this.document + ' 60',
      this.customConsoleCSS
    );
    this._sharedService.emitChange({
      from: 'app',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });
    this.store.dispatch(LoadMain());
  }

  ngOnInit(): void {
    this._sharedService.emitChange({
      from: 'login',
      to: 'all',
      property: 'onlyConsoleMessage',
      thing: 'Data from login',
    });
    this.getMain();

    // Set window width for SSR compatibility

    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
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

  async onSubmit() {
    try {
      let user = await this._mainService.login(this.user).toPromise();
      if (!user || !user.user) {
        throw new Error('No se encontró el usuario.');
      }

      let token = await this._mainService.login(this.user, true).toPromise();
      if (!token || !token.token) {
        throw new Error('No se pudo conseguir el token.');
      }

      this.identity = user.user;
      this.store.dispatch(
        SesionLoaded({ sesion: { active: true, identity: this.identity } })
      );
      this._webService.consoleLog(
        this.identity,
        this.document + ' 57',
        this.customConsoleCSS
      );
      this.token = token.token;
      this._webService.consoleLog(
        this.token,
        this.document + ' 63',
        this.customConsoleCSS
      );

      //LocalStorage del identity

      if (typeof window !== 'undefined') {
        localStorage.setItem('ILP', JSON.stringify(this.identity));
      }

      this._sharedService.emitChange({
        from: 'login',
        to: 'all',
        property: 'identity',
        thing: this.identity,
      });

      //LocalStorage del token

      if (typeof window !== 'undefined') {
        localStorage.setItem('TLP', this.token);
      }

      this._router.navigate(['/inicio']);

      //Alerta
      Swal.fire({
        title: 'Usuario logueado correctamente',
        html: 'El usuario se ha identificado correctamente.',
        icon: 'success',
        customClass: {
          popup: 'ank ank-bg-fullRed',
          title: 'text-bg-whatsApp',
          closeButton: 'bg-whatsApp',
          confirmButton: 'bg-whatsApp',
        },
      });
    } catch (e: any) {
      this._webService.consoleLog(
        e,
        this.document + ' 59',
        this.customConsoleCSS
      );

      //Alerta
      Swal.fire({
        title: 'Usuario no logueado',
        html:
          'El usuario no se ha logueado correctamente. <br/> ' +
          e.error.message,
        icon: 'error',
        customClass: {
          popup: 'ank ank-bg-fullRed',
          title: 'text-titleM',
          closeButton: 'ank ank-text-fullYellow',
          confirmButton: 'ank ank-text-fullYellow',
        },
      });
    }
  }
}
