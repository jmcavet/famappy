import { computed, inject, Injectable } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { RecipeStateService } from '../../services/state/recipe.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class ManageIngredientCategoriesFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  /** Domain access (business state & actions) */
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );
  private modalService = inject(ModalService);

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
   * Computed signals
   * ================================ */
  readonly canShowPage = computed(() => {
    return (
      this.ingredientCategoriesLoading() ||
      this.ingredientCategoriesSaving() ||
      this.ingredientCategoriesUpdating() ||
      this.ingredientCategoriesDeleting()
    );
  });

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */
  public openAddIngredientCategoryInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new ingredient category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbIngredientCategories(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addIngredientCategory(name);
          })();
        },
      },
    );
  }

  public openUpdateIngredientCategoryInputModal(
    event: MouseEvent,
    ingredientCategory: any,
  ) {
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

  openDeleteIngredientCategoryModal(
    event: MouseEvent,
    ingredientCategoryId: string,
  ) {
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

  /** Private methods */
  private async addIngredientCategory(ingredientCategoryName: string) {
    this.ingredientCategoryDomainFacade.saveRecipeCategory(
      ingredientCategoryName,
    );
  }

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
