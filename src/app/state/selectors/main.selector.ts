import { createSelector } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import MainState from '../../core/interfaces/main.state';
export const MainSelector = (state: AppState) => state.main;
export const MainLoadedSelector = createSelector(
  MainSelector,
  (state: MainState) => state.loading
);

export const MainMainSelector = createSelector(
  MainSelector,
  (state: MainState) => state.main
);
