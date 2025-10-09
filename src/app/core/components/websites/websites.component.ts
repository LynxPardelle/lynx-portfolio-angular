/**
 * WebsitesComponent - Enhanced with Angular 20 Features
 * 
 * Modern features implemented:
 * - Signals for reactive state management
 * - inject() function instead of constructor injection
 * - firstValueFrom() instead of deprecated .toPromise()
 * - Proper subscription cleanup with takeUntil pattern
 * - Computed properties for derived state
 * - Effects for side effects handling
 * - Modern error handling patterns
 * - Loading states with signals
 * - Type-safe interfaces
 * - Enhanced component lifecycle management
 */
import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
// Environment
import { environment } from '../../../../environments/environment';
// RxJs
import { Observable, Subject, firstValueFrom, takeUntil, catchError, EMPTY } from 'rxjs';
// Interfaces
import { IMain } from '../../interfaces/main';
// Models
import { Main, WebSite } from '../../models/main';

// Enhanced interfaces for better type safety
interface SharedContentMessage {
  from: string;
  to: string;
  property: 'lang' | 'identity' | 'windowWidth' | 'onlyConsoleMessage';
  thing: any;
}

// Services
import { MainService } from '../../services/main.service';
import { SharedService } from '../../../shared/services/shared.service';
import { WebService } from '../../../shared/services/web.service';
// Libraries
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
export class WebsitesComponent implements OnInit, OnDestroy {
  // Services (Modern inject pattern)
  private readonly mainService = inject(MainService);
  private readonly sharedService = inject(SharedService);
  private readonly webService = inject(WebService);
  private readonly store = inject(Store<AppState>);

  // Signals for reactive state management
  public identity = signal<any>(null);
  public main = signal<Main | null>(null);
  public webSites = signal<WebSite[]>([]);
  public webSite = signal<WebSite>(new WebSite('', '', '', '', '', '', '', '', '', null, null, null, 0));
  public lang = signal<string>('es');
  public edit = signal<boolean>(false);
  public windowWidth = signal<number>(window.innerWidth);
  
  // Loading states
  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);

  // Computed values
  public readonly urlMain = computed(() => environment.api + '/main/');
  public readonly canEdit = computed(() => {
    const identity = this.identity();
    return identity && identity.role === 'ROLE_ADMIN';
  });

  // Form property accessors for ngModel (since signals don't work directly with ngModel)
  get currentWebSiteTitle() { return this.webSite().title; }
  set currentWebSiteTitle(value: string) { 
    this.webSite.update(ws => ({ ...ws, title: value })); 
  }

  get currentWebSiteTitleEng() { return this.webSite().titleEng; }
  set currentWebSiteTitleEng(value: string) { 
    this.webSite.update(ws => ({ ...ws, titleEng: value })); 
  }

  get currentWebSiteType() { return this.webSite().type; }
  set currentWebSiteType(value: string) { 
    this.webSite.update(ws => ({ ...ws, type: value })); 
  }

  get currentWebSiteTypeEng() { return this.webSite().typeEng; }
  set currentWebSiteTypeEng(value: string) { 
    this.webSite.update(ws => ({ ...ws, typeEng: value })); 
  }

  get currentWebSiteDesc() { return this.webSite().desc; }
  set currentWebSiteDesc(value: string) { 
    this.webSite.update(ws => ({ ...ws, desc: value })); 
  }

  get currentWebSiteDescEng() { return this.webSite().descEng; }
  set currentWebSiteDescEng(value: string) { 
    this.webSite.update(ws => ({ ...ws, descEng: value })); 
  }

  get currentWebSiteLink() { return this.webSite().link; }
  set currentWebSiteLink(value: string) { 
    this.webSite.update(ws => ({ ...ws, link: value })); 
  }

  get currentWebSiteInsert() { return this.webSite().insert; }
  set currentWebSiteInsert(value: string) { 
    this.webSite.update(ws => ({ ...ws, insert: value })); 
  }

  // Constants
  public readonly document = 'websites.component.ts';
  public readonly customConsoleCSS = 'background-color: rgba(70, 35, 70, 1); color: white; padding: 1em;';

  // Observables
  public main$: Observable<IMain | undefined>;
  private readonly destroy$ = new Subject<void>();
  constructor() {
    // Initialize observables
    this.main$ = this.store.select(MainMainSelector);

    // Set up shared service subscription with proper cleanup
    this.sharedService.changeEmitted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sharedContent: any) => {
        if (
          typeof sharedContent === 'object' &&
          sharedContent.from !== 'websites' &&
          (sharedContent.to === 'websites' || sharedContent.to === 'all')
        ) {
          this.handleSharedContent(sharedContent);
        }
      });

    // Initialize identity
    this.identity.set(this.mainService.getIdentity());
    this.webService.consoleLog(
      this.identity(),
      this.document + ' initialization',
      this.customConsoleCSS
    );
    
    // Emit identity change
    this.sharedService.emitChange({
      from: 'websites',
      to: 'all',
      property: 'identity',
      thing: this.identity(),
    });

    // Load main data
    this.store.dispatch(LoadMain());

    // Set up effect for window resize handling
    effect(() => {
      const width = this.windowWidth();
      // Handle window width changes if needed
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleSharedContent(sharedContent: SharedContentMessage): void {
    switch (sharedContent.property) {
      case 'lang':
        this.lang.set(sharedContent.thing as string);
        break;
      case 'identity':
        this.identity.set(sharedContent.thing);
        break;
      case 'windowWidth':
        this.windowWidth.set(sharedContent.thing as number);
        break;
      case 'onlyConsoleMessage':
        this.webService.consoleLog(
          sharedContent.thing,
          this.document + ' shared message',
          this.customConsoleCSS
        );
        break;
    }
  }

  private async handleApiError(error: unknown, context: string): Promise<void> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const err = error as any;
      if (err.error?.message) {
        errorMessage = err.error.message;
        if (err.error.errorMessage) {
          errorMessage += '<br/>' + err.error.errorMessage;
        }
      }
    }

    this.webService.consoleLog(
      error,
      `${this.document} ${context} error`,
      this.customConsoleCSS
    );

    await Swal.fire({
      title: 'Error',
      html: `Failed operation in ${context}.<br/>${errorMessage}`,
      icon: 'error',
      customClass: {
        popup: 'ank ank-bg-fullRed',
        title: 'ank ank-text-fullYellow',
        closeButton: 'ank ank-text-fullYellow',
        confirmButton: 'ank ank-text-fullYellow',
      },
    });
  }

  ngOnInit(): void {
    this.sharedService.emitChange({
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

  async getWebSites(): Promise<void> {
    if (this.isLoading()) return; // Prevent concurrent calls
    
    this.isLoading.set(true);
    try {
      const webSites = await firstValueFrom(
        this.mainService.getWebSites().pipe(
          catchError((error) => {
            console.error('Error fetching websites:', error);
            return EMPTY;
          })
        )
      );

      if (!webSites || !webSites.websites) {
        throw new Error('No websites data received from server.');
      }

      this.webSites.set(webSites.websites);
      this.webService.consoleLog(
        this.webSites(),
        this.document + ' getWebSites success',
        this.customConsoleCSS
      );
    } catch (error) {
      await this.handleApiError(error, 'getWebSites');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    if (this.isSubmitting()) return; // Prevent concurrent submissions
    
    this.isSubmitting.set(true);
    try {
      const currentWebSite = this.webSite();
      let result = await Swal.fire({
        title:
          currentWebSite._id && currentWebSite._id !== ''
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
        if (currentWebSite._id && currentWebSite._id !== '') {
          const websiteUpdated = await firstValueFrom(
            this.mainService.updateWebsite(currentWebSite._id, currentWebSite)
          );
          if (!websiteUpdated || !websiteUpdated.websiteUpdated) {
            throw new Error('No se actualizó el proyecto web.');
          }

          this.webSite.set(websiteUpdated.websiteUpdated);
          await this.getWebSites();
          Swal.fire({
            title: 'El proyecto web se ha actualizado con éxito',
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
          const webSite = await firstValueFrom(
            this.mainService.createWebSite(currentWebSite)
          );

          if (!webSite || !webSite.website) {
            throw new Error('No se creo el proyecto web.');
          }

          this.webSite.set(webSite.website);
          await this.getWebSites();
          Swal.fire({
            title: 'La creación del proyecto web se ha realizado con éxito',
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
    } catch (error) {
      await this.handleApiError(error, 'onSubmit');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteWebsite(id: string) {
    if (this.isDeleting()) return; // Prevent concurrent deletions
    
    this.isDeleting.set(true);
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
        const websiteDeleted = await firstValueFrom(
          this.mainService.deleteWebSite(id)
        );

        if (!websiteDeleted) {
          throw new Error('No hay proyecto web.');
        }

        await this.getWebSites();

        this.webService.consoleLog(
          websiteDeleted,
          this.document + ' deleteWebsite',
          this.customConsoleCSS
        );

        Swal.fire({
          title: 'El proyecto web se ha eliminado con éxito',
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
          title: 'No se eliminó el proyecto web.',
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
    } catch (error) {
      await this.handleApiError(error, 'deleteWebsite');
    } finally {
      this.isDeleting.set(false);
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
          return this.webSite()._id;
          break;
        default:
          return '';
          break;
      }
      return '';
    } catch (error) {
      await this.handleApiError(error, 'pre_load');
      return '';
    }
  }

  // Utility
  editChange() {
    const identity = this.identity();
    const canEdit = identity && identity.role && identity.role === 'ROLE_ADMIN';
    this.edit.set(canEdit ? !this.edit() : false);
  }

  websiteEdit(webSite: WebSite) {
    const currentWebSite = this.webSite();
    if (currentWebSite._id === '' || currentWebSite._id !== webSite._id) {
      this.webSite.set(webSite);
    } else {
      this.webSite.set(new WebSite(
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
      ));
    }
  }

  Linkify(
    text: string,
    textcolor: string = '#ffffff',
    linkcolor: string = '#f9c24f'
  ): string {
    try {
      const result = this.webService.Linkify(text, textcolor, linkcolor);

      if (result?.text) {
        this.webService.consoleLog(
          result.matches,
          this.document + ' Linkify success',
          this.customConsoleCSS
        );
        return result.text;
      }
      return text;
    } catch (error) {
      this.webService.consoleLog(
        error,
        this.document + ' Linkify error',
        this.customConsoleCSS
      );
      return text;
    }
  }
}
