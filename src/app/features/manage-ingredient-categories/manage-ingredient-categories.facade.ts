import { computed, inject, Injectable } from '@angular/core';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';
import { ModalService } from '../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../shared/layout/overlays/modal/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class ManageIngredientCategoriesFacade {
  /* ================================
   * Dependencies
   * ================================ */
  private modalService = inject(ModalService);

  /** Domain access (business state & actions) */
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  readonly ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;
  readonly ingredientCategoriesSaving =
    this.ingredientCategoryDomainFacade.ingredientCategoriesSaving;
  readonly ingredientCategoriesUpdating =
    this.ingredientCategoryDomainFacade.ingredientCategoriesUpdating;
  readonly ingredientCategoriesDeleting =
    this.ingredientCategoryDomainFacade.ingredientCategoriesDeleting;

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly pageIsLoading = computed(() => {
    return (
      this.ingredientCategoriesLoading() ||
      this.ingredientCategoriesSaving() ||
      this.ingredientCategoriesUpdating() ||
      this.ingredientCategoriesDeleting()
    );
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  openUpdateModal(event: MouseEvent, ingredientCategory: any) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update ingredient category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbIngredientCategories(),
        inputValue: ingredientCategory.name,
      },
      {
        onConfirm: (ingredientCategoryNameUpdated: string) => {
          (async () => {
            await this.updateIngredientCategory(
              ingredientCategory.id,
              ingredientCategoryNameUpdated,
            );
          })();
        },
      },
    );
  }

  openDeleteModal(event: MouseEvent, ingredientCategoryId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(ingredientCategoryId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteIngredientCategory(ingredientCategoryId),
      },
    );
  }

  /* ================================
   * PRIVATE HELPERS
   * ================================ */
  private async updateIngredientCategory(
    ingredientCategoryIdToUpdate: string,
    newIngredientCategoryName: string,
  ) {
    await this.ingredientCategoryDomainFacade.updateIngredientCategory(
      ingredientCategoryIdToUpdate,
      newIngredientCategoryName,
      this.recipeService.mustPreserveState,
    );
  }

  private modalDeleteMessage(ingredientCategoryId: string) {
    const ingredientCategoryToDelete = this.dbIngredientCategories().find(
      (ingredientCategory) => ingredientCategory.id === ingredientCategoryId,
    );
    return `Do you really want to remove '${ingredientCategoryToDelete?.name}'?`;
  }

  private async deleteIngredientCategory(ingredientCategoryIdToDelete: string) {
    await this.ingredientCategoryDomainFacade.deleteIngredientCategory(
      ingredientCategoryIdToDelete,
    );
  }
}
