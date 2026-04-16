import { inject, Injectable, Signal } from '@angular/core';
import { MealBackendService } from '../services/backend/meal.service';
import {
  MealDocInBackend,
  MealDocWithIdInBackend,
} from '../features/meals/state/mealCart.model';

/** In domain facades, do NOT inject other domain facades, nor UI facades!! */

@Injectable({ providedIn: 'root' })
export class MealDomainFacade {
  // Meal-related state services
  private mealBackendService = inject(MealBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbMeals: Signal<MealDocWithIdInBackend[]> =
    this.mealBackendService.meals;

  readonly mealsLoading = this.mealBackendService.loading;

  async deleteMealByRecipeId(recipeId: string) {
    const meals = this.dbMeals();
    const mealToDelete = meals.find((m) => m.recipeId === recipeId);

    if (!mealToDelete) {
      throw new Error('Meal not found');
    }

    await this.mealBackendService.deleteMealFromStore(mealToDelete.id);
  }

  async updateMealsInStore(
    mealIdsToUpdate: string[],
    propertiesToUpdate: Partial<MealDocInBackend>,
  ) {
    await Promise.all(
      mealIdsToUpdate.map((mealId) =>
        this.mealBackendService.updateMealInStore(mealId, propertiesToUpdate),
      ),
    );
  }

  async deleteMealById(mealId: string) {
    await this.mealBackendService.deleteMealFromStore(mealId);
  }
}
