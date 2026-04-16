import {
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeWithId } from './components/recipe-card/recipe.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { FormsModule } from '@angular/forms';
import { MealCategoryBackendService } from '../../services/backend/meal-category.service';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../models/cuisine.model';
import { CuisineBackendService } from '../../services/backend/cuisine.service';
import { RecipeCategoryBackendService } from '../../services/backend/recipe-category.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { Timestamp } from 'firebase/firestore';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../models/ingredient.model';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { MealType } from '../meals/state/mealCart.model';
import { MealBackendService } from '../../services/backend/meal.service';
import { Location } from '@angular/common';

export interface RecipeWithDate extends RecipeWithId {
  dateCreated: Date | string | Timestamp;
}

@Component({
  selector: 'app-recipes',
  imports: [
    FormsModule,
    RecipeCardComponent,
    RecipeSearchComponent,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.css',
})
export class RecipesComponent {
  private router = inject(Router);
  private location = inject(Location);

  /** Transitional state (shared by several ui) */
  private mealBackendService = inject(MealBackendService);
  private recipeBackendService = inject(RecipeBackendService);
  private mealCategoryBackendService = inject(MealCategoryBackendService);
  private cuisineBackendService = inject(CuisineBackendService);
  private recipeCategoryBackendService = inject(RecipeCategoryBackendService);
  private recipeStateService = inject(RecipeStateService);
  private ingredientBackendService = inject(IngredientBackendService);
  private ingredientCategoryBackendService = inject(
    IngredientCategoryBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly recipesAreLoading = this.recipeBackendService.loading;

  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryBackendService.mealCategories;
  readonly mealCategoriesAreLoading = this.mealCategoryBackendService.loading;

  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineBackendService.cuisines;
  readonly cuisinesAreLoading = this.cuisineBackendService.loading;

  readonly dbRecipeCategories: Signal<RecipeCategoryDocInBackend[]> =
    this.recipeCategoryBackendService.recipeCategories;
  readonly recipeCategoriesAreLoading =
    this.recipeCategoryBackendService.loading;

  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientBackendService.ingredients;
  readonly ingredientsAreLoading = this.ingredientBackendService.loading;

  readonly dbIngredientCategories: Signal<IngredientCategoryDocInBackend[]> =
    this.ingredientCategoryBackendService.ingredientCategories;
  readonly ingredientCategoriesAreLoading =
    this.ingredientCategoryBackendService.loading;

  /** Declaration of local signals */
  recipeState = this.recipeStateService.recipeState;

  searchText = signal<string>('');

  filterText = signal<string>('');

  monique = computed(() => this.recipeState().filter.ingredientIds);
  ingredientFilterMode = computed(
    () => this.recipeState().filter.ingredientFilterMode,
  );

  ingredientsFiltered = computed(() => {
    const ingredientsFiltered = this.dbIngredients().filter((ingredient) => {
      return this.monique().includes(ingredient.id);
    });

    return ingredientsFiltered;
  });

  constructor() {
    effect(() => {
      (this.recipesFiltered() as RecipeWithDate[]).sort((a, b) => {
        const dateA = this.toDate(a.dateCreated);
        const dateB = this.toDate(b.dateCreated);

        console.log('JUST CHECKING...');
        return this.recipeStateService.dateIsIncreasing()
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
    });
  }

  recipesFilteredByTitle = computed(() => {
    return this.dbRecipes().filter((recipe) =>
      recipe.title.toLowerCase().includes(this.filterText().toLowerCase()),
    );
  });

  recipesFiltered = computed(() => {
    console.log('Recomputing');
    const recipeFilter = this.recipeState().filter;

    const mealCategoriesFiltered = recipeFilter.mealCategories;
    const cuisinesFiltered = recipeFilter.cuisines;
    const recipeCategoriesFiltered = recipeFilter.recipeCategories;
    const difficultyOptionsFiltered = recipeFilter.difficulties;
    const priceOptionsFiltered = recipeFilter.prices;
    const frequencyOptionsFiltered = recipeFilter.frequencies;
    const seasonOptionsFiltered = recipeFilter.seasons;
    const ingredientCategoriesFiltered = recipeFilter.ingredientCategories;
    const ingredientIdsFiltered = recipeFilter.ingredientIds;

    if (
      mealCategoriesFiltered.length === 0 &&
      cuisinesFiltered.length === 0 &&
      recipeCategoriesFiltered.length === 0 &&
      difficultyOptionsFiltered.length === 0 &&
      priceOptionsFiltered.length === 0 &&
      frequencyOptionsFiltered.length === 0 &&
      seasonOptionsFiltered.length === 0 &&
      ingredientCategoriesFiltered.length === 0 &&
      ingredientIdsFiltered.length == 0
    ) {
      return this.recipesFilteredByTitle();
    }

    const recipesFiltered = this.recipesFilteredByTitle().filter((obj) => {
      const cond1 =
        mealCategoriesFiltered.length === 0
          ? true
          : mealCategoriesFiltered.includes(obj.mealCategoryId);

      const cond2 =
        cuisinesFiltered.length === 0
          ? true
          : cuisinesFiltered.includes(obj.cuisineId);

      const cond3 =
        recipeCategoriesFiltered.length === 0
          ? true
          : obj.recipeCategoryIds.some((id) =>
              recipeCategoriesFiltered.includes(id),
            );

      const cond4 =
        difficultyOptionsFiltered.length === 0
          ? true
          : difficultyOptionsFiltered.includes(obj.difficulty);

      const cond5 =
        priceOptionsFiltered.length === 0
          ? true
          : priceOptionsFiltered.includes(obj.price);

      const cond6 =
        frequencyOptionsFiltered.length === 0
          ? true
          : frequencyOptionsFiltered.includes(obj.frequency);

      const cond7 =
        seasonOptionsFiltered.length === 0
          ? true
          : obj.seasonsSelected.some((freq) =>
              seasonOptionsFiltered.includes(freq),
            );

      let cond8 = true;
      if (ingredientCategoriesFiltered.length > 0) {
        // Each object has potentially multiple ingredients. Get their ids in a list
        const ingredientIds = obj.ingredients.map(
          (ingredient) => ingredient.id,
        );

        // Get the ingredients (among all from the database) which id can be found in the ingredientIds.
        // Then return a list of their categoryId property.
        const recipeIngredientCategoryIds = this.dbIngredients()
          .filter((ingredient) => ingredientIds.includes(ingredient.id))
          .map((ingredient) => ingredient.categoryId);

        // Get a unique set of the 'recipeIngredientCategories' list
        const uniqueRecipeIngredientCategoryIds = [
          ...new Set(
            recipeIngredientCategoryIds.filter((str) => str.trim() !== ''),
          ),
        ];

        // The condition is true if at least one of the recipe ingredient category ids is included
        // in the list of ingredient category tag selected by the user
        cond8 = ingredientCategoriesFiltered.some((item) =>
          uniqueRecipeIngredientCategoryIds.includes(item),
        );
      }

      let cond9 = true;
      if (this.ingredientFilterMode() === 0) {
        cond9 =
          this.ingredientsFiltered().length === 0
            ? true
            : obj.ingredients.some((ingredient) =>
                this.monique().includes(ingredient.id),
              );
      } else {
        cond9 =
          this.ingredientsFiltered().length === 0
            ? true
            : this.monique().every((el) =>
                obj.ingredients.map((item) => item.id).includes(el),
              );
      }

      const cond10 = obj.ingredients.some((ingredient) =>
        this.ingredientsFiltered().map((ingredientFiltered) =>
          ingredientFiltered.id.includes(ingredient.id),
        ),
      );

      return (
        cond1 &&
        cond2 &&
        cond3 &&
        cond4 &&
        cond5 &&
        cond6 &&
        cond7 &&
        cond8 &&
        cond9 &&
        cond10
      );
    });

    return recipesFiltered;
  });

  private toDate(value: any): Date {
    if (value instanceof Date) {
      return value;
    }
    if (value?.toDate instanceof Function) {
      return value.toDate(); // Firestore Timestamp
    }
    return new Date(value); // Try parsing string or fallback
  }

  readonly canShowPage = computed(() => {
    return (
      this.recipesAreLoading() &&
      this.mealCategoriesAreLoading() &&
      this.cuisinesAreLoading() &&
      this.dbRecipeCategories() &&
      this.ingredientsAreLoading() &&
      this.ingredientCategoriesAreLoading()
    );
  });

  /** When clicking on recipe card, it should either:
   * - view the recipe itself (navigate to /recipes/<recipeId>)
   * - or select the recipe clicked and add it to the corresponding section (lunch or dinner) on the /meals page
   */
  async clickOnRecipeCard(recipe: RecipeWithId) {
    const { weekDay, mealType, servings, cookId } = history.state;
    if (mealType) {
      this.saveRecipeIntoCalendar(weekDay, recipe, mealType, servings, cookId);

      this.location.back();
    } else {
      // Navigate with the recipe ID and pass the recipe object in the state
      this.router.navigate(['/recipes', recipe.id], {
        state: { recipe: recipe },
      });
    }
  }

  private async saveRecipeIntoCalendar(
    weekDay: any,
    recipe: RecipeWithId,
    mealType: MealType,
    servings: number,
    cookId: string,
  ) {
    try {
      const mealToSave = {
        weekDay,
        recipe,
        mealType,
        servings,
        cookId,
        manualRecipe: null,
      };
      const mealIds = await this.mealBackendService.saveMealsIntoStore([
        mealToSave,
      ]);

      if (!mealIds) throw new Error('No meal IDs returned');
    } catch (error) {
      console.log('SOME ERROR WHILE SAVING MEALS: ', error);
    } finally {
      console.log('...');
    }
  }
}
