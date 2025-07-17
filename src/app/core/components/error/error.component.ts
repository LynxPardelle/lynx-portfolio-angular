import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
/* RxJs */
import { Observable } from 'rxjs';
/* Interfaces */
import { IMain } from '../../interfaces/main';
/* State */
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/state/app.state';
import { MainMainSelector } from 'src/app/state/selectors/main.selector';
import { LoadMain } from 'src/app/state/actions/main.actions';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [],
})
export class ErrorComponent implements OnInit {
  public main!: IMain;
  /* State */
  public main$: Observable<IMain | undefined>;

  constructor(private store: Store<AppState>, private router: Router) {
    this.main$ = store.select(MainMainSelector);
    this.store.dispatch(LoadMain());
  }

  ngOnInit(): void {
    this.getMain();
  }
  /* State */
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

  goHome() {
    this.router.navigate(['/']);
  }
}
