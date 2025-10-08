import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
/* RxJs */
import { Observable, catchError, tap, throwError } from 'rxjs';
/* Services */
import { MainService } from '../services/main.service';
import { NgxAngoraService } from 'ngx-angora-css';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  /*
  let\sheaders\s=\snew HttpHeaders\(\{\r?\s+'Content-Type': 'application/json',\r?\s+Authorization: this._userService.getToken\(\),\r?\s+\}\);
  */

  constructor(
    private _mainService: MainService,
    private _ankService: NgxAngoraService
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const reqClone: HttpRequest<unknown> =
      this._mainService.getToken() !== null
        ? req.clone({
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this._mainService.getToken(),
            }),
          })
        : req.clone({
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
            }),
          });
    return next.handle(reqClone).pipe(
      catchError(this.handleError),
      tap({
        next: () => {
          console.log('HTTP request successful, updating CSS...');
          setTimeout(() => {
            this._ankService.cssCreate();
          }, this._ankService.timeBetweenReCreate * 1.5);
        },
      })
    );
  }

  handleError(e: HttpErrorResponse) {
    console.error(e);
    let eMessage = e.error && e.error.message ? e.error.message : e.message;
    return throwError(() => new Error(eMessage));
  }
}

// Modern functional interceptor for Angular 19
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const mainService = inject(MainService);

  const reqClone: HttpRequest<unknown> =
    mainService.getToken() !== null
      ? req.clone({
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: mainService.getToken(),
          }),
        })
      : req.clone({
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        });

  return next(reqClone).pipe(
    catchError((e: HttpErrorResponse) => {
      console.error(e);
      let eMessage = e.error && e.error.message ? e.error.message : e.message;
      return throwError(() => new Error(eMessage));
    })
  );
};
