import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/* RxJs */
import { Observable, catchError, throwError } from 'rxjs';
import { MainService } from '../services/main.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  /*
  let\sheaders\s=\snew HttpHeaders\(\{\r?\s+'Content-Type': 'application/json',\r?\s+Authorization: this._userService.getToken\(\),\r?\s+\}\);
  */

  constructor(private _mainService: MainService) {}

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
    return next.handle(reqClone).pipe(catchError(this.handleError));
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
