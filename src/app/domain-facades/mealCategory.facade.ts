import { inject, Injectable, Signal } from '@angular/core';
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
}
