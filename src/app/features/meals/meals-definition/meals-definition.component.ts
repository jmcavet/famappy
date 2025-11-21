import {
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { MealCategoryBackendService } from '../../../services/backend/meal-category.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MealStateService } from '../../../services/state/meal.service';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { RecipeBackendService } from '../../../services/backend/recipe.service';

@Component({
  selector: 'app-meals-definition',
  imports: [ReactiveFormsModule, LoadingComponent, NgClass, RouterLink],
  templateUrl: './meals-definition.component.html',
  styleUrl: './meals-definition.component.css',
})
export class MealsDefinitionComponent {
  /** Services */
  private mealCategoryService = inject(MealCategoryBackendService);
  private recipeBackendService = inject(RecipeBackendService);
  private stateMealService = inject(MealStateService);

  /** Declaration of local signals */
  mealState = this.stateMealService.mealState;

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryService.mealCategories;
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly mealCategoriesAreLoading = this.mealCategoryService.loading;

  fb = inject(FormBuilder);

  nbMeals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  nbMealSelected = new FormControl(1); // default value

  // Local state for storing the meal category ids selected by users
  readonly selectedCategories = signal<RecipeCategoryDocInBackend[]>([]);
  readonly selectedCategoriesIds = signal<string[]>([]);

  // Meal category ids for all available recipes
  readonly filteredCategories = computed(() => {
    const categories = this.dbMealCategories();

    // Whenever the data has not loaded yet
    if (!categories.length) return [];

    // Retrieve all (unique) meal category ids of stored recipes
    const recipesMealCategoryIds = [
      ...new Set(this.dbRecipes().map((r) => r.mealCategoryId)),
    ];

    return categories.filter((cat) => recipesMealCategoryIds.includes(cat.id));
  });

  toggleSelection(category: RecipeCategoryDocInBackend) {
    const categoriesNew = this.selectedCategories();

    if (!this.selectedCategories().includes(category)) {
      categoriesNew.push(category);
    } else {
      categoriesNew.splice(
        categoriesNew.findIndex((obj) => obj.id === category.id),
        1
      );
    }

    this.selectedCategories.set(categoriesNew);
    this.selectedCategoriesIds.set(categoriesNew.map((cat) => cat.id));
  }

  readonly isLoading = computed(() => {
    return (
      this.mealCategoriesAreLoading() || this.filteredCategories().length === 0
    );
  });

  proceed() {
    this.stateMealService.saveMealCategories(this.selectedCategories());
    if (this.nbMealSelected.value) {
      this.stateMealService.saveNbPlannedMeals(this.nbMealSelected.value);
    }
  }
}
