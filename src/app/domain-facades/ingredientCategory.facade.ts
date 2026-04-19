import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
import { IngredientCategoryDocInBackend } from '../models/ingredient.model';
import { IngredientCategoryBackendService } from '../services/backend/ingredient-category.service';

@Injectable({ providedIn: 'root' })
export class IngredientCategoryDomainFacade {
  private ingredientCategoryBackendService = inject(
    IngredientCategoryBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories: Signal<IngredientCategoryDocInBackend[]> =
    this.ingredientCategoryBackendService.ingredientCategories;

  readonly ingredientCategoriesLoading =
    this.ingredientCategoryBackendService.loading;

  readonly ingredientCategoriesSaving =
    this.ingredientCategoryBackendService.saving;

  readonly ingredientCategoriesUpdating =
    this.ingredientCategoryBackendService.updating;

  readonly ingredientCategoriesDeleting =
    this.ingredientCategoryBackendService.deleting;

  public saveRecipeCategory(ingredientCategoryName: string) {
    this.ingredientCategoryBackendService.saveRecipeCategoryIntoStore(
      ingredientCategoryName,
    );
  }

  public updateIngredientCategory(
    ingredientCategoryIdToUpdate: string,
    newIngredientCategoryName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this.ingredientCategoryBackendService.updateIngredientCategoryInStore(
      ingredientCategoryIdToUpdate,
      newIngredientCategoryName,
      mustPreserveState,
    );
  }

  public deleteIngredientCategory(ingredientCategoryIdToDelete: string) {
    this.ingredientCategoryBackendService.deleteIngredientCategoryInStore(
      ingredientCategoryIdToDelete,
    );
  }
}
