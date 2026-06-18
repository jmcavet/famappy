import { Component, computed, inject, input, Input } from '@angular/core';
import { RecipeState } from '../../../../models/recipe.model';
import { MinToHourPipe } from '../../../../shared/pipes/mintohour.pipe';
import { CuisineBackendService } from '../../../../services/backend/cuisine.service';
import { MealCategoryBackendService } from '../../../../services/backend/meal-category.service';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';

@Component({
  selector: 'app-recipe-card',
  imports: [
    MinToHourPipe,
    CardComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    CapitalizePipe,
    RowComponent,
    TagComponent,
  ],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  // @Input() recipeState?: RecipeState;
  recipeState = input<RecipeState>();

  activated = input<boolean>(false);
  cardSurface = input<'0' | '1' | '2' | '3'>('1');

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

  mealCategoryName = computed(() => {
    const mealCategories = this.mealCategoryService.mealCategories();
    const mealCategoryId = this.recipeState()?.mealCategoryId;

    const mealCategoryName = mealCategories.find(
      (c) => c.id === mealCategoryId,
    );

    return mealCategoryName?.name ?? 'None';
  });

  get totalTime() {
    const totalTime =
      Number(this.recipeState()?.preparationTime ?? 0) +
      Number(this.recipeState()?.cookingTime ?? 0);

    return totalTime;
  }

  difficultyMessage = computed(() => {
    if (this.recipeState()?.difficulty === 'easy') {
      return 'easy';
    } else if (this.recipeState()?.difficulty === 'medium') {
      return 'medium';
    } else {
      return 'hard';
    }
  });

  difficultyClass = computed(() => {
    const difficulty =
      this.recipeState()?.difficulty === 'easy'
        ? 'high'
        : this.recipeState()?.difficulty === 'medium'
          ? 'medium'
          : 'low';

    return `text-scale-${difficulty} dark:text-scaleDark-${difficulty}`;
  });

  difficultyScale = computed(() =>
    this.recipeState()?.difficulty === 'easy'
      ? 'scaleHigh'
      : this.recipeState()?.difficulty === 'medium'
        ? 'scaleMedium'
        : 'scaleLow',
  );
}
