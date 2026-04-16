import { computed, effect, inject, Injectable, Signal } from '@angular/core';
import { getWeekDays, months } from '../../shared/utils/calendar';
import {
  MealDocInBackend,
  MealDocWithIdInBackend,
} from './state/mealCart.model';
import { MealBackendService } from '../../services/backend/meal.service';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { MealCategoryBackendService } from '../../services/backend/meal-category.service';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { MealCategoryDocInBackend } from '../../models/cuisine.model';

export interface MealDateRef {
  id: string;
  weekDay: {
    year: number;
    monthName: string;
    dayOfMonth: number;
  };
}

@Injectable({ providedIn: 'root' })
export class MealFacade {
  // Backend services
  private mealBackendService = inject(MealBackendService);
  private recipeBackendService = inject(RecipeBackendService);
  private mealCategoryBackendService = inject(MealCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly mealsLoading: Signal<boolean> = this.mealBackendService.loading;
  readonly dbMeals: Signal<MealDocWithIdInBackend[]> =
    this.mealBackendService.meals;

  readonly recipesLoading: Signal<boolean> = this.recipeBackendService.loading;
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;

  readonly mealCategoriesLoading: Signal<boolean> =
    this.mealCategoryBackendService.loading;
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryBackendService.mealCategories;

  constructor() {
    effect(() => {
      // Identify meals potentially older to the current date. If found, remove them from the database.
      const meals = this.backendMeals();

      if (meals.length === 0) return;

      this.cleanOldMeals(meals);
    });
  }

  // Get the list of week days (with properties: dayName, dayOfMonth, monthName, year, weekDays)
  weekDays = getWeekDays();

  /*
  -------------------------
  CONPUTED VALUES (EXPOSED)
  -------------------------
  */
  readonly dataIsLoading = computed(
    () =>
      this.mealsLoading() ||
      this.recipesLoading() ||
      this.mealCategoriesLoading(),
  );

  readonly backendMeals = computed(() => {
    // A meal from the backend represents only 1 recipe!
    // Transform the meals so that we get the recipe object itself instead of its id

    // Wait until the recipes and mealCategories have been loaded from the database
    if (this.dataIsLoading()) return [];

    const backendMeals = this.dbMeals().map((meal) => {
      const recipe = this.dbRecipes().find((r) => r.id === meal.recipeId);

      // Manual recipe entry (no reference to an existing recipe in database)
      if (meal.recipeId === null) {
        return {
          id: meal.id,
          weekDay: meal.weekDay,
          mealType: meal.mealType,
          servings: meal.servings,
          cookId: meal.cookId ?? null,
          recipe: null,
          manualRecipe: meal.manualRecipe,
        };
      }

      if (!recipe) return null;

      // Reference to an existing recipe.
      // Search for the mealCategoryName and add it to the recipe object
      const mealCategoryName = this.dbMealCategories().find(
        (cat) => cat.id === recipe.mealCategoryId,
      )?.name;

      return {
        id: meal.id,
        weekDay: meal.weekDay,
        mealType: meal.mealType,
        servings: meal.servings,
        cookId: meal.cookId ?? null,
        recipe: { ...recipe, mealCategoryName },
        manualRecipe: meal.manualRecipe,
      };
    });

    return backendMeals.filter((meal) => meal !== null);
  });

  readonly dailyMealPlans = computed(() => {
    // A meal from the backend represents only 1 recipe!
    // Transform the meals so that we get the recipe object itself instead of its id

    // Wait until the recipes and mealCategories have been loaded from the database
    if (this.dataIsLoading()) return;

    const dailyMealPlans = this.weekDays.map((weekDay) => ({
      weekDay,
      recipes: this.backendMeals().filter(
        (cart) =>
          cart.weekDay.dayName === weekDay.dayName &&
          cart.weekDay.dayOfMonth === weekDay.dayOfMonth &&
          cart.weekDay.monthName === weekDay.monthName,
      ),
    }));

    console.log('dailyMealPlans: ', dailyMealPlans);
    return dailyMealPlans;
  });
  /*
  
  ----------------------------
  METHODS
  ----------------------------
  */
  cleanOldMeals(backendMeals: MealDateRef[]) {
    const oldMeals = backendMeals?.filter((meal) => {
      const day = meal.weekDay;
      const monthIndex = months.indexOf(day.monthName);
      const mealDate = new Date(day.year, monthIndex, day.dayOfMonth);
      mealDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return mealDate < today;
    });
    if (oldMeals && oldMeals.length > 0) {
      oldMeals?.map((meal) => this.deleteMealFromStore(meal.id));
    }
  }

  async deleteMealFromStore(mealId: string) {
    this.mealBackendService.deleteMealFromStore(mealId);
  }

  async updateMealFromStore(
    mealIdsToUpdate: string[],
    propertiesToUpdate: Partial<MealDocInBackend>,
  ) {
    mealIdsToUpdate.forEach((mealId) => {
      this.mealBackendService.updateMealInStore(mealId, propertiesToUpdate);
    });
  }
}
