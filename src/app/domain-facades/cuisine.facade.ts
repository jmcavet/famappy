import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
import { CuisineBackendService } from '../services/backend/cuisine.service';
import { CuisineDocInBackend } from '../models/cuisine.model';

@Injectable({ providedIn: 'root' })
export class CuisineDomainFacade {
  private cuisineBackendService = inject(CuisineBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineBackendService.cuisines;

  readonly cuisinesLoading = this.cuisineBackendService.loading;
  readonly cuisinesSaving = this.cuisineBackendService.saving;
  readonly cuisinesUpdating = this.cuisineBackendService.updating;
  readonly cuisinesDeleting = this.cuisineBackendService.deleting;

  public async updateCuisine(
    cuisineIdToUpdate: string,
    newCuisineName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    await this.cuisineBackendService.updateCuisineInStore(
      cuisineIdToUpdate,
      newCuisineName,
      mustPreserveState,
    );
  }

  public async deleteCuisine(cuisineIdToUpdate: string) {
    await this.cuisineBackendService.deleteCuisineInStore(cuisineIdToUpdate);
  }
}
