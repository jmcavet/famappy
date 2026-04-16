import { computed, Injectable, Signal } from '@angular/core';
import { MealWithId } from '../../state/mealCart.model';
import { CalendarDay } from '../calendar/calendar.facade';

@Injectable({ providedIn: 'root' })
export class MealDayCardFacade {
  private _dailyMealPlan?: Signal<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>;

  /** called by the component */
  connect(
    dailyMealPlan: Signal<{ weekDay: CalendarDay; recipes: MealWithId[] }>
  ) {
    this._dailyMealPlan = dailyMealPlan;
  }

  /** Computed helpers */
  readonly dailyLunchMeals = computed(() =>
    this._dailyMealPlan
      ? this._dailyMealPlan().recipes.filter((m) => m.mealType === 'lunch')
      : []
  );

  readonly dailyDinnerMeals = computed(() =>
    this._dailyMealPlan
      ? this._dailyMealPlan().recipes.filter((m) => m.mealType === 'dinner')
      : []
  );

  readonly lunchServings = computed(() => {
    const meal = this.dailyLunchMeals()[0];
    return meal?.servings ?? 2;
  });

  readonly dinnerServings = computed(() => {
    const meal = this.dailyDinnerMeals()[0];
    return meal?.servings ?? 4;
  });
}
