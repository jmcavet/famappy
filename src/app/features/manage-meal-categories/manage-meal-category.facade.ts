import { computed, inject, Injectable } from '@angular/core';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { MealCategoryDomainFacade } from '../../domain-facades/mealCategory.facade';
import { RecipeStateService } from '../../services/state/recipe.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { RecipeDomainFacade } from '../../domain-facades/recipe.facade';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class ManageMealCategoryFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  /** Domain access (business state & actions) */
  private mealCategoryDomainFacade = inject(MealCategoryDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);

  private modalService = inject(ModalService);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbMealCategories = this.mealCategoryDomainFacade.dbMealCategories;
  readonly mealCategoriesLoading =
    this.mealCategoryDomainFacade.mealCategoriesLoading;
  readonly mealCategoriesSaving =
    this.mealCategoryDomainFacade.mealCategoriesSaving;
  readonly mealCategoriesUpdating =
    this.mealCategoryDomainFacade.mealCategoriesUpdating;
  readonly mealCategoriesDeleting =
    this.mealCategoryDomainFacade.mealCategoriesDeleting;
  readonly recipeUpdating = this.recipeDomainFacade.recipesUpdating;

  readonly dbRecipes = this.recipeDomainFacade.dbRecipes;

  /* ================================
   * Computed signals
   * ================================ */
  readonly mealCategoryId = computed(
    () => this.recipeService.recipeState().mealCategoryId,
  );

  readonly canShowPage = computed(() => {
    return (
      this.mealCategoriesLoading() ||
      this.mealCategoriesSaving() ||
      this.mealCategoriesUpdating() ||
      this.mealCategoriesDeleting() ||
      this.recipeUpdating()
    );
  });

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */
  public openAddMealCategoryInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new meal category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbMealCategories(),
      },
      {
        onConfirm: (name: string) => {
          // TODO: SHOULD I USE AWAIT HERE? YET, I CANNOT ADD ASYNC IN FRONT OF onConfirm!!
          this.addMealCategory(name);
        },
      },
    );
  }

  public openUpdateMealCategoryInputModal(
    event: MouseEvent,
    mealCategory: any,
  ) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update meal category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbMealCategories(),
        inputValue: mealCategory.name,
      },
      {
        onConfirm: (mealCategoryNameUpdated: string) => {
          // TODO: SHOULD I USE AWAIT HERE? YET, I CANNOT ADD ASYNC IN FRONT OF onConfirm!!
          this.updateMealCategory(mealCategory.id, mealCategoryNameUpdated);
        },
      },
    );
  }

  openDeleteModal(event: MouseEvent, mealCategoryId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(mealCategoryId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteMealCategoryId(mealCategoryId),
      },
    );
  }

  /** Private methods */
  private async addMealCategory(mealCategoryName: string) {
    this.mealCategoryDomainFacade.saveMealCategory(mealCategoryName);
  }

  private async updateMealCategory(
    mealCategoryIdToUpdate: string,
    newMealCategoryName: string,
  ) {
    this.mealCategoryDomainFacade.updateMealCategory(
      mealCategoryIdToUpdate,
      newMealCategoryName,
      this.recipeService.mustPreserveState,
    );
  }

  private modalDeleteMessage(mealCategoryId: string) {
    const mealCategoryToDelete = this.dbMealCategories().find(
      (mealCategory) => mealCategory.id === mealCategoryId,
    );
    return `Do you really want to remove '${mealCategoryToDelete?.name}'?`;
  }

  private async deleteMealCategoryId(mealCategoryIdToDelete: string) {
    const recipesWithMealCategoryId = this.dbRecipes().filter(
      (recipe) => recipe.mealCategoryId === mealCategoryIdToDelete,
    );

    // Reset the 'mealCategoryId' property (to '') of the recipes which mealCategoryId
    // corresponds to the one just deleted)
    await this.recipeDomainFacade.resetRecipesProperties(
      recipesWithMealCategoryId,
      { mealCategoryId: '' },
      this.recipeService.mustPreserveState,
    );
  }
}
