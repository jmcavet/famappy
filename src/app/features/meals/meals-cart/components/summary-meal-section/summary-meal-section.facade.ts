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
    console.log('AAA this.selectedDay(): ', this.selectedDay());
    const { dayName, dayOfMonth } = this.selectedDay();

    console.log('finalCart: ', this.finalCart());
    const weekDayMeals = this.finalCart().filter((p) => {
      console.log('p.weekDay: ', p.weekDay);
      console.log('this.selectedDay(): ', this.selectedDay());
      console.log('A=B: ', p.weekDay === this.selectedDay());
      return (
        p.weekDay.dayName === dayName && p.weekDay.dayOfMonth === dayOfMonth
      );
    });

    console.log('weekDayMeals: ', weekDayMeals);

    const mealCategories = this._dbMealCategories();

    const mealCategoryIds = weekDayMeals.map(
      (meal) => meal.recipe?.mealCategoryId,
    );
    console.log('mealCategoryIds: ', mealCategoryIds);

    // Meal Categories that correspond to the meals assigned to the selected day
    const WeekDayMealCategories = mealCategories.filter((cat) =>
      mealCategoryIds.includes(cat.id),
    );

    console.log('WeekDayMealCategories: ', WeekDayMealCategories);

    const mealsWithCategoryName = weekDayMeals.map((meal) => {
      const mealCategoryId = meal.recipe?.mealCategoryId;
      const mealCategoryName = WeekDayMealCategories.find(
        (t) => t.id === mealCategoryId,
      )?.name;
      const updatedRecipe = { ...meal.recipe, mealCategoryName };

      return { ...meal, recipe: updatedRecipe };
    });

    console.log('mealsWithCategoryName: ', mealsWithCategoryName);

    return mealsWithCategoryName;
  });
}
