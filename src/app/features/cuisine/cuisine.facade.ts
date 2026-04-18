import { computed, inject, Injectable } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { CuisineDomainFacade } from '../../domain-facades/cuisine.facade';
import { CuisineBackendService } from '../../services/backend/cuisine.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { Location } from '@angular/common';

@Injectable()
export class CuisineFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  private location = inject(Location);

  /** Domain access (business state & actions) */
  private cuisineDomainFacade = inject(CuisineDomainFacade);
  private cuisineService = inject(CuisineBackendService);
  private modalService = inject(ModalService);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly cuisinesLoading = this.cuisineDomainFacade.cuisinesLoading;
  readonly dbCuisines = this.cuisineDomainFacade.dbCuisines;

  /* ================================
   * Computed signals
   * ================================ */
  readonly canShowPage = computed(() => {
    return this.cuisinesLoading();
  });

  readonly cuisineId = computed(
    () => this.recipeService.recipeState().cuisineId,
  );

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */
  public openAddCuisineInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new cuisine',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbCuisines(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addCuisine(name);
          })();
        },
      },
    );
  }

  public selectCuisine(cuisineId: string) {
    this.recipeService.updateProperty('cuisineId', cuisineId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }

  /** Private methods */
  private async addCuisine(cuisineName: string) {
    this.cuisineService.saveCuisineIntoStore(cuisineName);
  }
}
