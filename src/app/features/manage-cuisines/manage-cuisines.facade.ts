import { computed, inject, Injectable } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { CuisineDomainFacade } from '../../domain-facades/cuisine.facade';
import { CuisineBackendService } from '../../services/backend/cuisine.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { RecipeDomainFacade } from '../../domain-facades/recipe.facade';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { RecipeBackendService } from '../../services/backend/recipe.service';

@Injectable()
export class ManageCuisinesFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  /** Domain access (business state & actions) */
  private cuisineDomainFacade = inject(CuisineDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);
  private cuisineService = inject(CuisineBackendService);
  readonly recipeBackendService = inject(RecipeBackendService);
  private modalService = inject(ModalService);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly cuisinesLoading = this.cuisineDomainFacade.cuisinesLoading;
  readonly cuisinesSaving = this.cuisineDomainFacade.cuisinesSaving;
  readonly cuisinesUpdating = this.cuisineDomainFacade.cuisinesUpdating;
  readonly cuisinesDeleting = this.cuisineDomainFacade.cuisinesDeleting;
  readonly dbCuisines = this.cuisineDomainFacade.dbCuisines;
  readonly recipesUpdating = this.recipeDomainFacade.recipesUpdating;
  readonly dbRecipes = this.recipeDomainFacade.dbRecipes;

  /* ================================
   * Computed signals
   * ================================ */
  readonly canShowPage = computed(() => {
    return (
      this.cuisinesLoading() ||
      this.cuisinesSaving() ||
      this.cuisinesUpdating() ||
      this.cuisinesDeleting() ||
      this.recipesUpdating()
    );
  });

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

  public openUpdateCuisineInputModal(event: MouseEvent, cuisine: any) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update cuisine',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbCuisines(),
        inputValue: cuisine.name,
      },
      {
        onConfirm: (cuisineNameUpdated: string) => {
          (async () => {
            await this.updateCuisine(cuisine.id, cuisineNameUpdated);
          })();
        },
      },
    );
  }

  public openDeleteModal(event: MouseEvent, cuisineId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(cuisineId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteCuisine(cuisineId),
      },
    );
  }

  /** Private methods */
  private async addCuisine(cuisineName: string) {
    this.cuisineService.saveCuisineIntoStore(cuisineName);
  }

  private async updateCuisine(
    cuisineIdToUpdate: string,
    newCuisineName: string,
  ) {
    await this.cuisineDomainFacade.updateCuisine(
      cuisineIdToUpdate,
      newCuisineName,
      this.recipeService.mustPreserveState,
    );
  }

  private modalDeleteMessage(cuisineId: string) {
    const cuisineToDelete = this.dbCuisines().find(
      (cuisine) => cuisine.id === cuisineId,
    );

    return `Do you really want to remove the '${cuisineToDelete?.name}' cuisine ?`;
  }

  async deleteCuisine(cuisineId: string) {
    // Delete the cuisine document from the 'cuisines' collection
    this.cuisineDomainFacade.deleteCuisine(cuisineId);

    const recipesWithCuisineId = this.dbRecipes().filter(
      (recipe) => recipe.cuisineId === cuisineId,
    );

    // Reset the 'cuisineId' property (to '') of the recipes which cuisineId
    // corresponds to the one just deleted)
    await this.recipeBackendService.resetRecipesPropertiesInStore(
      recipesWithCuisineId,
      { cuisineId: '' },
      this.recipeService.mustPreserveState,
    );
  }
}
