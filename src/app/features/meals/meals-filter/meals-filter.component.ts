import {
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { Difficulty, Frequency, Season } from '../../../models/recipe.model';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { CuisineBackendService } from '../../../services/backend/cuisine.service';
import { MealStateService } from '../../../services/state/meal.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { RecipeCategoryBackendService } from '../../../services/backend/recipe-category.service';
import { RecipeBackendService } from '../../../services/backend/recipe.service';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-meals-filter',
  imports: [LoadingComponent, CapitalizePipe, RouterLink, NgClass],
  templateUrl: './meals-filter.component.html',
  styleUrl: './meals-filter.component.css',
})
export class MealsFilterComponent {
  /** Services */
  private stateMealService = inject(MealStateService);
  private cuisineBackendService = inject(CuisineBackendService);
  private recipeCategoryService = inject(RecipeCategoryBackendService);
  private recipeBackendService = inject(RecipeBackendService);

  /** Declaration of local signals */
  mealState = this.stateMealService.mealState;

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineBackendService.cuisines;
  readonly cuisinesAreLoading = this.cuisineBackendService.loading;
  readonly dbRecipeCategories: Signal<MealCategoryDocInBackend[]> =
    this.recipeCategoryService.recipeCategories;
  readonly recipeCategoriesAreLoading = this.recipeCategoryService.loading;
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  recipes = signal<RecipeWithId[]>([]);
  readonly recipesAreLoading = this.recipeBackendService.loading;

  /** Declaration of meal state signals */
  readonly seasonsSelected = computed(() => this.mealState().seasonsSelected);
  readonly difficultiesSelected = computed(
    () => this.mealState().difficultiesSelected
  );
  readonly cuisinesSelected = computed(() => this.mealState().cuisinesSelected);
  readonly frequenciesSelected = computed(
    () => this.mealState().frequenciesSelected
  );
  readonly selectedCategoryIds = computed<Set<string>>(() => {
    return new Set(this.mealState().recipeCategoryIds);
  });
  readonly recipesFiltered = computed(() => this.mealState().recipesFiltered);

  cuisineOptions: CuisineDocInBackend[] = [];
  seasonOptions: Season[] = [];
  difficultyOptions: Difficulty[] = [];
  frequencyOptions: Frequency[] = [];
  recipeCategoryOptions: RecipeCategoryDocInBackend[] = [];

  constructor() {
    // Define which options must be displayed, depending on the filtered recipes.

    // Return the ids of the meal categories previously selected by users
    const mealCategoriesIdsSelected =
      this.mealState().mealCategoriesSelected.map((obj) => obj.id);

    // Return only recipes that have the meal categories previously selected by users
    const recipes = this.dbRecipes().filter((recipe) =>
      mealCategoriesIdsSelected.includes(recipe.mealCategoryId)
    );

    console.log('RECIPES: ', recipes);
    this.recipes.set(recipes);

    effect(() => {
      if (recipes.length > 0) {
        // Update your state with the loaded recipes
        this.stateMealService.filterRecipes(recipes);

        // Get all the cuisine ids of the filtered recipes
        const cuisineIds = [
          ...new Set(recipes.flatMap((recipe) => recipe.cuisineId)),
        ];
        // Define the options (cuisine objects) to display
        this.cuisineOptions = this.dbCuisines().filter((obj) =>
          cuisineIds.includes(obj.id)
        );

        // Define the options (difficulty objects) to display
        this.difficultyOptions = [
          ...new Set(recipes.map((recipe) => recipe.difficulty)),
        ];

        // Define the options (season objects) to display
        this.seasonOptions = [
          ...new Set(recipes.flatMap((recipe) => recipe.seasonsSelected)),
        ];

        // Define the options (frequency objects) to display
        this.frequencyOptions = [
          ...new Set(recipes.map((recipe) => recipe.frequency)),
        ];

        // Get all the recipe category ids of the filtered recipes
        const recipeCategoryIds = [
          ...new Set(recipes.flatMap((recipe) => recipe.recipeCategoryIds)),
        ];
        // Define the options (recipe category objects) to display
        this.recipeCategoryOptions = this.dbRecipeCategories().filter((obj) =>
          recipeCategoryIds.includes(obj.id)
        );
      }
    });
  }

  setSeason(seasonSelected: Season) {
    this.stateMealService.setSeason(seasonSelected);

    this.stateMealService.filterRecipesTest(this.recipes());
  }

  setCuisine(cuisineSelected: CuisineDocInBackend) {
    this.stateMealService.setCuisine(cuisineSelected);

    this.stateMealService.filterRecipesTest(this.recipes());
  }

  setDifficulty(difficultySelected: Difficulty) {
    this.stateMealService.setDifficulty(difficultySelected);

    this.stateMealService.filterRecipesTest(this.recipes());
  }

  setFrequency(frequencySelected: Frequency) {
    this.stateMealService.setFrequency(frequencySelected);

    this.stateMealService.filterRecipesTest(this.recipes());
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    this.stateMealService.setRecipeCategory(recipeCategorySelected);

    this.stateMealService.filterRecipesTest(this.recipes());
  }

  readonly dataIsLoading = computed(() => {
    return (
      this.cuisinesAreLoading() ||
      this.recipeCategoriesAreLoading() ||
      this.recipesAreLoading()
    );
  });
}
