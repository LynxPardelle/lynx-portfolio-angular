import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* RxJs */
import { Observable } from 'rxjs';
/* Environment */
import { environment } from '../../../../environments/environment';
/* Interfaces */
import { IMain } from '../../interfaces/main';
/* Models */
import { Main, Video } from '../../models/main';
/* Services */
import { MainService } from '../../services/main.service';
import { WebService } from '../../../shared/services/web.service';
import { SharedService } from '../../../shared/services/shared.service';
/* Extras */
import Swal from 'sweetalert2';
/* State */
import { Store } from '@ngrx/store';
import { AppState } from '../../../state/app.state';
import { MainMainSelector } from '../../../state/selectors/main.selector';
import { LoadMain } from '../../../state/actions/main.actions';
/* Shared Components */
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
/* Pipes */
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html';
/* Libraries */
import { YouTubePlayerModule } from '@angular/youtube-player';
@Component({
  selector: 'app-demoreel',
  templateUrl: './demoreel.component.html',
  styleUrls: ['./demoreel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploaderComponent,
    SafeHtmlPipe,
    YouTubePlayerModule,
  ],
})
export class DemoreelComponent implements OnInit {
  public identity: any;
  public main!: Main;
  public videos: Video[] = [];
  public video: Video = new Video('', '', '', '', '', null, 0);

  /* Translate */
  public lang: string = 'es';

  /* Urls */
  public urlMain: string = environment.api + '/main/';

  /* Console Settings */
  public document: string = 'demoreel.component.ts';
  public customConsoleCSS =
    'background-color: rgba(90, 170, 90, 0.75); color: black; padding: 1em;';

  /* Utility */
  public edit: boolean = false;
  public windowWidth = window.innerWidth;
  /* State */
  public main$: Observable<IMain | undefined>;
  constructor(
    private _mainService: MainService,
    private _webService: WebService,
    private _location: Location,
    private _sharedService: SharedService,
    private store: Store<AppState>
  ) {
    _sharedService.changeEmitted$.subscribe((sharedContent) => {
      if (
        typeof sharedContent === 'object' &&
        sharedContent.from !== 'demoreel' &&
        (sharedContent.to === 'demoreel' || sharedContent.to === 'all')
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

    /* Identity */
    this.identity = this._mainService.getIdentity();
    this._webService.consoleLog(
      this.identity,
      this.document + ' 79',
      this.customConsoleCSS
    );
    this._sharedService.emitChange({
      from: 'demoreel',
      to: 'all',
      property: 'identity',
      thing: this.identity,
    });
    this.store.dispatch(LoadMain());
  }

  ngOnInit(): void {
    this._sharedService.emitChange({
      from: 'demoreel',
      to: 'all',
      property: 'onlyConsoleMessage',
      thing: 'Data from demoreel',
    });

    this.getMain();
    this.getVideos();

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
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

  async getVideos() {
    try {
      let videos = await this._mainService.getVideos().toPromise();

      if (!videos || !videos.videos) {
        throw new Error('There is no videos.');
      }

      this.videos = videos.videos;
      this._webService.consoleLog(
        this.videos,
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
          this.video._id && this.video._id !== ''
            ? '¿Seguro que quieres hacer los cambios?'
            : '¿Seguro que quieres crear el video?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      });
      if (!result) {
        throw new Error('Error con la opción.');
      }
      if (result.isConfirmed) {
        if (this.video._id && this.video._id !== '') {
          const videoUpdated = await this._mainService
            .updateVideo(this.video._id, this.video)
            .toPromise();
          if (!videoUpdated || !videoUpdated.videoUpdated) {
            throw new Error('No se actualizó el video.');
          }

          this.video = videoUpdated.videoUpdated;
          this.getVideos();
          Swal.fire({
            title: 'El video se ha creado con éxito',
            text: '',
            icon: 'success',
            customClass: {
              popup: 'ank ank-bg-fullRed',
              title: 'ank ank-text-fullYellow',
              closeButton: 'ank ank-text-fullYellow',
              confirmButton: 'ank ank-text-fullYellow',
            },
          });
        } else {
          const video = await this._mainService
            .createVideo(this.video)
            .toPromise();

          if (!video || !video.video) {
            throw new Error('No se creo el video.');
          }

          this.video = video.video;
          this.getVideos();
          Swal.fire({
            title: 'La creación del video se ha realizado con éxito',
            text: '',
            icon: 'success',
            customClass: {
              popup: 'ank ank-bg-fullRed',
              title: 'ank ank-text-fullYellow',
              closeButton: 'ank ank-text-fullYellow',
              confirmButton: 'ank ank-text-fullYellow',
            },
          });
        }
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
        this.document + ' 131',
        this.customConsoleCSS
      );
    }
  }

  async deleteVideo(id: string) {
    try {
      let result = await Swal.fire({
        title: '¿Seguro que quieres eliminar el video?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si',
        denyButtonText: `No`,
      });

      if (!result) {
        throw new Error('Error con la opción.');
      }

      if (result.isConfirmed) {
        const videoDeleted = await this._mainService
          .deleteVideo(id)
          .toPromise();

        if (!videoDeleted) {
          throw new Error('No hay video.');
        }

        await this.getVideos();

        this._webService.consoleLog(
          videoDeleted,
          this.document + ' 257',
          this.customConsoleCSS
        );

        Swal.fire({
          title: 'El video se ha eliminado con éxito',
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
          title: 'No se eliminó el video.',
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
          popup: 'ank ank-bg-fullRed',
          title: 'text-titleM',
          closeButton: 'ank ank-text-fullYellow',
          confirmButton: 'ank ank-text-fullYellow',
        },
      });
    }
  }

  /* Upload */
  recoverThingFather(event: any) {
    this.getVideos();
  }

  async pre_load(event: any) {
    try {
      switch (event.type) {
        case 'video':
          await this.onSubmit();
          return this.video._id;
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
          popup: 'ank ank-bg-fullRed',
          title: 'ank ank-text-tdark',
          closeButton: 'ank ank-bg-fullYellow',
          confirmButton: 'ank ank-bg-fullGreen',
        },
      });

      return '';
    }
  }

  /* Utility */
  editChange() {
    this.edit =
      this.identity && this.identity.role && this.identity.role === 'ROLE_ADMIN'
        ? !this.edit
        : false;
  }

  videoEdit(video: Video) {
    if (this.video._id === '' || this.video._id !== video._id) {
      this.video = video;
    } else {
      this.video = new Video('', '', '', '', '', null, 0);
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

  checkWindowWidth(downUp: string, width: number) {
    return this._webService.checkWindowWidth(downUp, width);
  }
}
