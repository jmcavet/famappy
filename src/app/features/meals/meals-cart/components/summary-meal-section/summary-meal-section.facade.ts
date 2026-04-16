import { computed, inject, Injectable, Signal } from '@angular/core';
import { MealCartStateService } from '../../../state/mealCart.service';
import { Meal } from '../../../state/mealCart.model';
import { CalendarDay } from '../../../components/calendar/calendar.facade';
import { MealCategoryDocInBackend } from '../../../../../models/cuisine.model';

export interface DayServings {
  dayName: string;
  servings: number;
}

@Injectable({ providedIn: 'root' })
export class SummaryMealSectionFacade {
  // Meal-related state services
  private _cartService = inject(MealCartStateService);

  /** Private properties received from the component */
  private _dbMealCategories!: Signal<MealCategoryDocInBackend[]>;

  connect(dbMealCategories: Signal<MealCategoryDocInBackend[]>) {
    this._dbMealCategories = dbMealCategories;
  }

  /** Computed signals */
  readonly finalCart = computed<Meal[]>(
    () => this._cartService.state().finalCart,
  );

  readonly selectedDay = computed<CalendarDay>(
    () => this._cartService.state().selectedDay,
  );

  /** Methods */
  readonly mealsWithCategoryName = computed(() => {
    // Meals that have been assigned to the selected day
    const weekDayMeals = this.finalCart().filter(
      (p) => p.weekDay === this.selectedDay(),
    );
    const mealCategories = this._dbMealCategories();

    const mealCategoryIds = weekDayMeals.map(
      (meal) => meal.recipe?.mealCategoryId,
    );

    // Meal Categories that correspond to the meals assigned to the selected day
    const WeekDayMealCategories = mealCategories.filter((cat) =>
      mealCategoryIds.includes(cat.id),
    );

    const gege = weekDayMeals.map((meal) => {
      const mealCategoryId = meal.recipe?.mealCategoryId;
      const mealCategoryName = WeekDayMealCategories.find(
        (t) => t.id === mealCategoryId,
      )?.name;
      const updatedRecipe = { ...meal.recipe, mealCategoryName };

      const testPreparationTime = meal.recipe?.preparationTime;
      console.log('TYPE OF PREPARATION TIME: ', typeof testPreparationTime);
      return { ...meal, recipe: updatedRecipe };
    });

    return gege;
  });
}
