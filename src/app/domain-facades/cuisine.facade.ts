import { inject, Injectable, Signal } from '@angular/core';
import { CuisineBackendService } from '../services/backend/cuisine.service';
import { CuisineDocInBackend } from '../models/cuisine.model';

@Injectable({ providedIn: 'root' })
export class CuisineDomainFacade {
  private cuisineBackendService = inject(CuisineBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineBackendService.cuisines;

  readonly cuisinesLoading = this.cuisineBackendService.loading;
}
