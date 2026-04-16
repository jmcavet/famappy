import { Component, computed, inject, input, Input } from '@angular/core';
import { RecipeState } from '../../../../models/recipe.model';
import { MinToHourPipe } from '../../../../shared/pipes/mintohour.pipe';
import { CuisineBackendService } from '../../../../services/backend/cuisine.service';
import { MealCategoryBackendService } from '../../../../services/backend/meal-category.service';

@Component({
  selector: 'app-recipe-card',
  imports: [MinToHourPipe],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input() recipeState?: RecipeState;

  private cuisineService = inject(CuisineBackendService);
  private mealCategoryService = inject(MealCategoryBackendService);

  /** When the cuisines (retrieved from firestore) signal changes, find the one that matches the cuisineId from the state
   * Do not use a computed function since it will not be retrigered whenever one toggles the "Sort by" button.
   */
  getCuisineName(cuisineId: string): string {
    const cuisines = this.cuisineService.cuisines();
    const cuisine = cuisines.find((c) => c.id === cuisineId);
    return cuisine?.name ?? 'None';
  }

  getMealCategoryName(mealCategoryId: string): string {
    const mealCategories = this.mealCategoryService.mealCategories();
    const mealCategory = mealCategories.find((c) => c.id === mealCategoryId);
    return mealCategory?.name ?? 'None';
  }

  get totalTime() {
    const totalTime =
      Number(this.recipeState?.preparationTime ?? 0) +
      Number(this.recipeState?.cookingTime ?? 0);

    return totalTime;
  }

  difficultyMessage = computed(() => {
    if (this.recipeState?.difficulty === 'low') {
      return 'easy';
    } else if (this.recipeState?.difficulty === 'normal') {
      return 'normal';
    } else {
      return 'difficult';
    }
  });
}
