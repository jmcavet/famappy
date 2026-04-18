import { computed, inject, Injectable } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { RecipeStateService } from '../../services/state/recipe.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { RecipeDomainFacade } from '../../domain-facades/recipe.facade';
import { RecipeCategoryBackendService } from '../../services/backend/recipe-category.service';
import { RecipeCategoryDomainFacade } from '../../domain-facades/recipeCategory.facade';
import { RecipeBackendService } from '../../services/backend/recipe.service';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class ManageRecipeCategoryFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  /** Domain access (business state & actions) */
  private recipeDomainFacade = inject(RecipeDomainFacade);
  private recipeCategoryDomainFacade = inject(RecipeCategoryDomainFacade);
  private recipeCategoryService = inject(RecipeCategoryBackendService);
  private recipeBackendService = inject(RecipeBackendService);

  private modalService = inject(ModalService);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbRecipes = this.recipeDomainFacade.dbRecipes;

  readonly dbRecipeCategories =
    this.recipeCategoryDomainFacade.dbRecipeCategories;
  readonly recipeCategoriesLoading =
    this.recipeCategoryDomainFacade.recipeCategoriesLoading;
  readonly recipeCategoriesSaving =
    this.recipeCategoryDomainFacade.recipeCategoriesSaving;
  readonly recipeCategoriesDeleting =
    this.recipeCategoryDomainFacade.recipeCategoriesDeleting;
  readonly recipeCategoriesUpdating =
    this.recipeCategoryDomainFacade.recipeCategoriesUpdating;

  /* ================================
   * Computed signals
   * ================================ */
  readonly canShowPage = computed(() => {
    return (
      this.recipeCategoriesLoading() ||
      this.recipeCategoriesSaving() ||
      this.recipeCategoriesDeleting() ||
      this.recipeCategoriesUpdating()
    );
  });

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */
  public openAddRecipeCategoryInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new recipe category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbRecipeCategories(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addRecipeCategory(name);
          })();
        },
      },
    );
  }

  public openUpdateRecipeCategoryInputModal(
    event: MouseEvent,
    recipeCategory: any,
  ) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update recipe category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbRecipeCategories(),
        inputValue: recipeCategory.name,
      },
      {
        onConfirm: (recipeCategoryNameUpdated: string) => {
          (async () => {
            await this.updateRecipeCategory(
              recipeCategory.id,
              recipeCategoryNameUpdated,
            );
          })();
        },
      },
    );
  }

  openDeleteModal(event: MouseEvent, recipeCategoryId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(recipeCategoryId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => {
          (async () => {
            await this.deleteRecipeCategory(recipeCategoryId);
          })();
        },
      },
    );
  }

  /** Private methods */
  private async addRecipeCategory(recipeCategoryName: string) {
    this.recipeCategoryService.saveRecipeCategoryIntoStore(recipeCategoryName);
  }

  private async updateRecipeCategory(
    recipeCategoryIdToUpdate: string,
    newRecipeCategoryName: string,
  ) {
    await this.recipeCategoryDomainFacade.updateRecipeCategory(
      recipeCategoryIdToUpdate,
      newRecipeCategoryName,
      this.recipeService.mustPreserveState,
    );
  }

  private modalDeleteMessage(recipeCategoryId: string) {
    const recipeCategoryToDelete = this.dbRecipeCategories().find(
      (recipeCategory) => recipeCategory.id === recipeCategoryId,
    );
    return `Do you really want to remove '${recipeCategoryToDelete?.name}'?`;
  }

  private async deleteRecipeCategory(recipeCategoryId: string) {
    const recipesWithRecipeCategoryId = this.dbRecipes().filter((recipe) =>
      recipe.recipeCategoryIds.includes(recipeCategoryId),
    );

    // Delete the document from the 'recipe-categories' collection in the store
    await this.recipeCategoryService.deleteRecipeCategoryInStore(
      recipeCategoryId,
    );

    // Remove the recipe category Id from the list of ids in the property array 'recipeCategoryIds'
    // from the relevant recipe objects
    await this.recipeBackendService.updateRecipesAfterDeletingRecipeCategoryId(
      recipesWithRecipeCategoryId,
      recipeCategoryId,
      this.recipeService.mustPreserveState,
    );
  }
}
