import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
import { RecipeCategoryBackendService } from '../services/backend/recipe-category.service';
import { RecipeCategoryDocInBackend } from '../models/cuisine.model';

@Injectable({ providedIn: 'root' })
export class RecipeCategoryDomainFacade {
  private recipeCategoryBackendService = inject(RecipeCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipeCategories: Signal<RecipeCategoryDocInBackend[]> =
    this.recipeCategoryBackendService.recipeCategories;

  readonly recipeCategoriesLoading = this.recipeCategoryBackendService.loading;
  readonly recipeCategoriesSaving = this.recipeCategoryBackendService.saving;
  readonly recipeCategoriesDeleting =
    this.recipeCategoryBackendService.deleting;
  readonly recipeCategoriesUpdating =
    this.recipeCategoryBackendService.updating;

  public async updateRecipeCategory(
    recipeCategoryIdToUpdate: string,
    newRecipeCategoryName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    await this.recipeCategoryBackendService.updateRecipeCategoryInStore(
      recipeCategoryIdToUpdate,
      newRecipeCategoryName,
      mustPreserveState,
    );
  }
}
