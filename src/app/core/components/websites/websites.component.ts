import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// Environment
import { environment } from 'src/environments/environment';
// RxJs
import { Observable } from 'rxjs';
// Interfaces
import { IMain } from 'src/app/core/interfaces/main';
// Models
import { Main, WebSite } from '../../models/main';
// Services
import { MainService } from '../../services/main.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WebService } from 'src/app/shared/services/web.service';
// Libraries
import Swal from 'sweetalert2';
// State
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { MainMainSelector } from 'src/app/state/selectors/main.selector';
import { LoadMain } from 'src/app/state/actions/main.actions';
// Shared Components
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
// Pipes
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    FileUploaderComponent,
    TranslatePipe,
    SafeHtmlPipe,
  ],
})
export class WebsitesComponent implements OnInit {
  public identity: any;
  public main!: Main;
  public webSites: WebSite[] = [];
  public webSite: WebSite = new WebSite(
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    null,
    null,
    null,
    0
  );
  // Translate
  public lang: string = 'es';
  // Urls
  public urlMain: string = environment.api + '/main/';
  // Console Settings
  public document: string = 'websites.component.ts';
  public customConsoleCSS =
    'background-color: rgba(70, 35, 70, 1); color: white; padding: 1em;';
  // Utility
  public edit: boolean = false;
  public windowWidth = window.innerWidth;
  // State
  public main$: Observable<IMain | undefined>;
  constructor(
    private _mainService: MainService,
    private _sharedService: SharedService,
    private _webService: WebService,
    private store: Store<AppState>
  ) {
    _sharedService.changeEmitted$.subscribe((sharedContent: any) => {
      if (
        typeof sharedContent === 'object' &&
        sharedContent.from !== 'websites' &&
        (sharedContent.to === 'websites' || sharedContent.to === 'all')
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
              this.document + ' 67',
              this.customConsoleCSS
            );
            break;
        }
      }
    });
    this.main$ = store.select(MainMainSelector);

    // Identity
    this.identity = this._mainService.getIdentity();
    this._webService.consoleLog(
      this.identity,
      this.document + ' 79',
      this.customConsoleCSS
    );
    this._sharedService.emitChange({
      from: 'websites',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });
    this.store.dispatch(LoadMain());
  }

  ngOnInit(): void {
    this._sharedService.emitChange({
      from: 'websites',
      to: 'all',
      property: 'onlyConsoleMessage',
      thing: 'Data from websites',
    });
    this.getMain();
    this.getWebSites();
  }

  // State
  getMain() {
    this.main$.subscribe({
      next: (m: any) => {
        if (m !== undefined) {
          this.main = m;
        }
      },
      error: (e: unknown) => console.error(e),
    });
  }

  async getWebSites() {
    try {
      let webSites = await this._mainService.getWebSites().toPromise();

      if (!webSites || !webSites.websites) {
        throw new Error('There is no websites.');
      }

      this.webSites = webSites.websites;
      this._webService.consoleLog(
        this.webSites,
        this.document + ' 113',
        this.customConsoleCSS
      );
    } catch (err) {
      this._webService.consoleLog(
        err,
        this.document + ' 119',
        this.customConsoleCSS
      );
    }
  }

  async onSubmit() {
    try {
      let result = await Swal.fire({
        title:
          this.webSite._id && this.webSite._id !== ''
            ? '¿Seguro que quieres hacer los cambios?'
            : '¿Seguro que quieres crear el proyecto web?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      });
      if (!result) {
        throw new Error('Error con la opción.');
      }
      if (result.isConfirmed) {
        if (this.webSite._id && this.webSite._id !== '') {
          const websiteUpdated = await this._mainService
            .updateWebsite(this.webSite._id, this.webSite)
            .toPromise();
          if (!websiteUpdated || !websiteUpdated.websiteUpdated) {
            throw new Error('No se actualizó el proyecto web.');
          }

          this.webSite = websiteUpdated.websiteUpdated;
          this.getWebSites();
          Swal.fire({
            title: 'El proyecto web se ha creado con éxito',
            text: '',
            icon: 'success',
            customClass: {
              popup: 'bef bef-bg-fullRed',
              title: 'bef bef-text-fullYellow',
              closeButton: 'bef bef-text-fullYellow',
              confirmButton: 'bef bef-text-fullYellow',
            },
          });
        } else {
          const webSite = await this._mainService
            .createWebSite(this.webSite)
            .toPromise();

          if (!webSite || !webSite.website) {
            throw new Error('No se creo el proyecto web.');
          }

          this.webSite = webSite.website;
          this.getWebSites();
          Swal.fire({
            title: 'La creación del proyecto web se ha realizado con éxito',
            text: '',
            icon: 'success',
            customClass: {
              popup: 'bef bef-bg-fullRed',
              title: 'bef bef-text-fullYellow',
              closeButton: 'bef bef-text-fullYellow',
              confirmButton: 'bef bef-text-fullYellow',
            },
          });
        }
      } else if (result.isDenied) {
        Swal.fire({
          title: 'No se hicieron los cambios.',
          text: '',
          icon: 'info',
          customClass: {
            popup: 'bef bef-bg-fullRed',
            title: 'bef bef-text-fullYellow',
            closeButton: 'bef bef-text-fullYellow',
            confirmButton: 'bef bef-text-fullYellow',
          },
        });
      }
    } catch (err) {
      this._webService.consoleLog(
        err,
        this.document + ' 131',
        this.customConsoleCSS
      );
    }
  }

  async deleteWebsite(id: string) {
    try {
      let result = await Swal.fire({
        title: '¿Seguro que quieres eliminar el proyecto web?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      });

      if (!result) {
        throw new Error('Error con la opción.');
      }

      if (result.isConfirmed) {
        const websiteDeleted = await this._mainService
          .deleteWebSite(id)
          .toPromise();

        if (!websiteDeleted) {
          throw new Error('No hay proyecto web.');
        }

        await this.getWebSites();

        this._webService.consoleLog(
          websiteDeleted,
          this.document + ' 257',
          this.customConsoleCSS
        );

        Swal.fire({
          title: 'El proyecto web se ha eliminado con éxito',
          text: '',
          icon: 'success',
          customClass: {
            popup: 'bef bef-bg-fullRed',
            title: 'bef bef-text-fullYellow',
            closeButton: 'bef bef-text-fullYellow',
            confirmButton: 'bef bef-text-fullYellow',
          },
        });
      } else if (result.isDenied) {
        Swal.fire({
          title: 'No se eliminó el proyecto web.',
          text: '',
          icon: 'info',
          customClass: {
            popup: 'bef bef-bg-fullRed',
            title: 'bef bef-text-fullYellow',
            closeButton: 'bef bef-text-fullYellow',
            confirmButton: 'bef bef-text-fullYellow',
          },
        });
      }
    } catch (err: any) {
      this._webService.consoleLog(
        err,
        this.document + ' 108',
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
          popup: 'bef bef-bg-fullRed',
          title: 'text-titleM',
          closeButton: 'bef bef-text-fullYellow',
          confirmButton: 'bef bef-text-fullYellow',
        },
      });
    }
  }

  // Upload
  recoverThingFather(event: any) {
    this.getWebSites();
  }

  async pre_load(event: any) {
    try {
      switch (event.type) {
        case 'video':
          await this.onSubmit();
          return this.webSite._id;
          break;
        default:
          return '';
          break;
      }
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
          popup: 'bef bef-bg-fullRed',
          title: 'bef bef-text-tdark',
          closeButton: 'bef bef-bg-fullYellow',
          confirmButton: 'bef bef-bg-fullGreen',
        },
      });

      return '';
    }
  }

  // Utility
  editChange() {
    this.edit =
      this.identity && this.identity.role && this.identity.role === 'ROLE_ADMIN'
        ? !this.edit
        : false;
  }

  websiteEdit(webSite: WebSite) {
    if (this.webSite._id === '' || this.webSite._id !== webSite._id) {
      this.webSite = webSite;
    } else {
      this.webSite = new WebSite(
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        null,
        null,
        null,
        0
      );
    }
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
      this._webService.consoleLog(
        value.matches,
        this.document + ' 105',
        this.customConsoleCSS
      );
      return value.text;
    } else {
      return text;
    }
  }
}
