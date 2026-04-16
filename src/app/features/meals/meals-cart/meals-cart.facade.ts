import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { MealDefinitionStateService } from '../state/mealDefinition.service';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { MealCartStateService } from '../state/mealCart.service';
import { Meal } from '../state/mealCart.model';
import { MealCategoryDocInBackend } from '../../../models/cuisine.model';
import { CalendarDay } from '../components/calendar/calendar.facade';
import { MealBackendService } from '../../../services/backend/meal.service';

export interface DayServings {
  dayName: string;
  servings: number;
}

@Injectable({ providedIn: 'root' })
export class MealCartFacade {
  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  toggleRecipe(recipe: RecipeWithId) {
    this._cartService.state.update((state) => {
      const exists = state.selectedRecipes.some((r) => r.id === recipe.id);

      return {
        ...state,
        selectedRecipes: exists
          ? state.selectedRecipes.filter((r) => r.id !== recipe.id)
          : [...state.selectedRecipes, recipe],
      };
    });
  }

  async validateAssignment() {
    try {
      const mealIds = await this._mealBackendService.saveMealsIntoStore(
        this.finalCart(),
      );

      console.log('mealIds: ', mealIds);

      this.resetFinalCart();
      if (!mealIds) throw new Error('No meal IDs returned');
    } catch (error) {
      console.log('SOME ERROR WHILE SAVING MEALS: ', error);
      // const message =
      //   this.buttonSaveOrUpdate() === 'Save'
      //     ? 'Recipe could not be saved in database'
      //     : 'Recipe could not be updated in database';
      // this.toastService.show(message, 'error');
    }
  }

  resetFinalCart() {
    this._cartService.resetFinalCart();
  }

  // Meal-related state services
  private _defService = inject(MealDefinitionStateService);
  private _cartService = inject(MealCartStateService);
  private _mealBackendService = inject(MealBackendService);

  /** Public properties */
  readonly uiSelectedRecipes = signal<RecipeWithId[]>([]);
  readonly lunchServings = signal<number>(2);
  readonly dinnerServings = signal<number>(4);

  /** Private properties received from the component */
  private _dbMealCategories!: Signal<MealCategoryDocInBackend[]>;

  connect(dbMealCategories: Signal<MealCategoryDocInBackend[]>) {
    this._dbMealCategories = dbMealCategories;
  }

  /** Computed signals */
  readonly cartWithMealCategoryNames = computed(() => {
    const mealCategories = this._dbMealCategories();

    const cartUpdated = this.cart().map((recipe) => {
      const mealCategory = mealCategories.find(
        (cat) => cat.id === recipe.mealCategoryId,
      );
      const mealCategoryName = mealCategory?.name;

      return { recipe: { ...recipe, mealCategoryName } };
    });

    return cartUpdated;
  });

  readonly cartMealCategoryIds = computed(() => {
    return this.cart().map((r) => r.mealCategoryId);
  });

  readonly mealCategoriesSelected = computed(
    () => this._defService.state().mealCategoriesSelected,
  );

  readonly cart = computed<RecipeWithId[]>(
    () => this._cartService.state().cart,
  );

  readonly finalCart = computed<Meal[]>(
    () => this._cartService.state().finalCart,
  );

  readonly selectedRecipes = computed<RecipeWithId[]>(
    () => this._cartService.state().selectedRecipes,
  );

  readonly selectedDay = computed<CalendarDay>(
    () => this._cartService.state().selectedDay,
  );
}
