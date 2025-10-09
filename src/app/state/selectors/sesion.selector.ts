import { createSelector } from '@ngrx/store';
import { AppState } from '../../state/app.state';
import { ISesion } from '../../auth/interfaces/sesion';
export const SesionSelector = (state: AppState) => state.sesion;
export const SesionLoadedSelector = createSelector(
  SesionSelector,
  (state: ISesion) => state.active
);

export const IdentitySelector = createSelector(
  SesionSelector,
  (state: ISesion) => state.identity
);
