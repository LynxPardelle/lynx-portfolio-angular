import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// RxJs
import { lastValueFrom, Observable } from 'rxjs';
// Environment
import { environment } from '../../../../environments/environment';
// Interfaces
import { IMain } from '../../interfaces/main';
// Models
import { Main } from '../../models/main';
// Services
import { MainService } from '../../services/main.service';
import { SharedService } from '../../../shared/services/shared.service';
import { WebService } from '../../../shared/services/web.service';
import { NgxAngoraService } from 'ngx-angora-css';
import Swal from 'sweetalert2';
// State
import { Store } from '@ngrx/store';
import { AppState } from '../../../state/app.state';
import { MainMainSelector } from '../../../state/selectors/main.selector';
import { LoadMain } from '../../../state/actions/main.actions';
// Shared Components
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
// Pipes
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    FileUploaderComponent,
    SafeHtmlPipe,
    TranslatePipe
  ],
})
export class InicioComponent implements OnInit {
  public identity: any;
  public main!: Main;
  // Translate
  public lang: string = 'es';
  // Urls
  public urlMain: string = environment.api + '/main/';
  // Console Settings
  public document: string = 'inicio.component.ts';
  public customConsoleCSS =
    'background-color: rgba(24, 54, 100, 0.75); color: white; padding: 1em;';
  // Utility
  public edit: boolean = false;
  public windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  // State
  public main$: Observable<IMain | undefined>;
  constructor(
    private _mainService: MainService,
    private _sharedService: SharedService,
    private _webService: WebService,
    private _ankService: NgxAngoraService,
    private store: Store<AppState>
  ) {
    _sharedService.changeEmitted$.subscribe((sharedContent: any) => {
      if (
        typeof sharedContent === 'object' &&
        sharedContent.from !== 'inicio' &&
        (sharedContent.to === 'inicio' || sharedContent.to === 'all')
      ) {
        switch (sharedContent.property) {
          case 'lang':
            this.lang = sharedContent.thing;
            break;
          case 'identity':
            this.identity = sharedContent.thing;
            break;
          case 'windowWidth':
            this.windowWidth = sharedContent.thing;
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

    this.identity = this._mainService.getIdentity();
    this._sharedService.emitChange({
      from: 'inicio',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });

    this.main$ = store.select(MainMainSelector);
    this.store.dispatch(LoadMain());
  }
  ngOnInit(): void {
    this._sharedService.emitChange({
      from: 'inicio',
      to: 'all',
      property: 'onlyConsoleMessage',
      thing: 'Data from inicio',
    });
    this.getMain();
  }

  getMain() {
    this.main$.subscribe({
      next: (m) => {
        if (m !== undefined) {
          this.main = m;
        }
      },
      error: (e: unknown) => console.error(e),
    });
  }

  async onSubmit() {
    try {
      let result = await Swal.fire({
        title: '¿Seguro que quieres hacer los cambios?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      });

      if (!result) {
        throw new Error('Error con la opción.');
      }

      if (result.isConfirmed) {
        const mainUpdated = await this._mainService
          .updateMain(this.main)
          .toPromise();

        if (!mainUpdated || !mainUpdated.main) {
          throw new Error('No se actualizó el main.');
        }

        this.main = mainUpdated.main;

        this._sharedService.emitChange({
          from: 'inicio',
          to: 'all',
          property: 'main',
          thing: this.main,
        });

        Swal.fire({
          title: 'Los cambios se han realizado con éxito',
          text: '',
          icon: 'success',
          customClass: {
            popup: 'ank ank-bg-fullRed',
            title: 'ank ank-text-fullYellow',
            closeButton: 'ank ank-text-fullYellow',
            confirmButton: 'ank ank-text-fullYellow',
          },
        });
      } else if (result.isDenied) {
        Swal.fire({
          title: 'No se hicieron los cambios.',
          text: '',
          icon: 'info',
          customClass: {
            popup: 'ank ank-bg-fullRed',
            title: 'ank ank-text-fullYellow',
            closeButton: 'ank ank-text-fullYellow',
            confirmButton: 'ank ank-text-fullYellow',
          },
        });
      }
    } catch (err) {
      this._webService.consoleLog(
        err,
        this.document + ' 159',
        this.customConsoleCSS
      );
    }
  }

  recoverThingFather(event: any) {
    (async () => {
      try {
        let main = await lastValueFrom(this._mainService.getMain());

        if (!main || !main.main) {
          throw new Error('No se pudo generar main.');
        }

        this.main = main.main;

        this._webService.consoleLog(
          this.main,
          this.document + ' 179',
          this.customConsoleCSS
        );

        this._sharedService.emitChange({
          from: 'inicio',
          to: 'all',
          property: 'main',
          thing: this.main,
        });
      } catch (err: any) {
        this._webService.consoleLog(
          err,
          this.document + ' 82',
          this.customConsoleCSS
        );
      }
    })();
  }

  async pre_load(event: any) {
    try {
      // switch (event.type) {
      //   case 'servicio':
      //     await this.onSubmit();
      //     return this.main._id;
      //     break;
      //   default:
      //     return '';
      //     break;
      // }
      return '';
    } catch (err: any) {
      this._webService.consoleLog(
        err,
        this.document + ' 181',
        this.customConsoleCSS
      );

      let errorMessage = '';
      if (err.error) {
        errorMessage = err.error.message;
        if (err.error.errorMessage) {
          errorMessage += '<br/>' + err.error.errorMessage;
        }
      } else {
        errorMessage = err.message;
      }

      //Alerta
      Swal.fire({
        title: 'Error',
        html: `Fallo en la petición.
          <br/>
          ${errorMessage}`,
        icon: 'error',
        customClass: {
          popup: 'bg-fullRed',
          title: 'text-tdark',
          closeButton: 'bg-fullYellow',
          confirmButton: 'bg-fullGreen',
        },
      });

      return '';
    }
  }

  editChange() {
    this.edit =
      this.identity && this.identity.role && this.identity.role === 'ROLE_ADMIN'
        ? !this.edit
        : false;
  }
  

  Linkify(
    text: string,
    textcolor: string = '#ffffff',
    linkcolor: string = '#f9c24f'
  ) {
    let value: any;
    value = {
      text: '',
      matches: [],
    };

    value = this._webService.Linkify(text, textcolor, linkcolor);

    if (value.text) {
      return value.text;
    } else {
      return text;
    }
  }
}
