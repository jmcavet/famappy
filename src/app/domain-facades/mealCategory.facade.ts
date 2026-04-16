import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
import { MealCategoryBackendService } from '../services/backend/meal-category.service';
import { MealCategoryDocInBackend } from '../models/cuisine.model';

@Injectable({ providedIn: 'root' })
export class MealCategoryDomainFacade {
  // Meal-related state services
  private mealCategoryBackendService = inject(MealCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryBackendService.mealCategories;

  readonly mealCategoriesLoading = this.mealCategoryBackendService.loading;
  readonly mealCategoriesSaving = this.mealCategoryBackendService.saving;
  readonly mealCategoriesUpdating = this.mealCategoryBackendService.updating;
  readonly mealCategoriesDeleting = this.mealCategoryBackendService.deleting;

  public saveMealCategory(mealCategoryName: string) {
    this.mealCategoryBackendService.saveMealCategoryIntoStore(mealCategoryName);
  }

  public async updateMealCategory(
    mealCategoryIdToUpdate: string,
    newMealCategoryName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    await this.mealCategoryBackendService.updateMealCategoryInStore(
      mealCategoryIdToUpdate,
      newMealCategoryName,
    );
  }

  public async deleteMealCategory(mealCategoryIdToDelete: string) {
    this.mealCategoryBackendService.deleteMealCategoryInStore(
      mealCategoryIdToDelete,
    );
  }
}
