import { inject, Injectable, Signal } from '@angular/core';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MealOptionsContextMenuFacade {
  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */

  /** Public UI methods */
  public navigateToRecipes(
    dailyMealPlan: Signal<{ weekDay: CalendarDay; recipes: MealWithId[] }>,
    mealType: Signal<MealType>,
  ) {
    const weekDay = dailyMealPlan().weekDay;

    const recipesPerTypeSelected = dailyMealPlan().recipes.filter(
      (r) => r.mealType === mealType(),
    );

    let servings;
    if (
      recipesPerTypeSelected.length > 0 &&
      recipesPerTypeSelected.map((r) => r.id).length > 0
    ) {
      servings = recipesPerTypeSelected[0].servings;
    } else {
      servings = ['saturday', 'sunday'].includes(weekDay.dayName)
        ? 4
        : mealType() === 'lunch'
          ? 2
          : 4;
    }

    // If no cook has been previously defined for the meals of this specific
    // day & meal type, set it to null, otherwise select the cook of the first available meal.
    const cookId = recipesPerTypeSelected[0]?.cookId ?? null;

    this.router.navigate(['/recipes'], {
      state: { weekDay, mealType: mealType(), servings, cookId },
    });
  }

  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/
  private router = inject(Router);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
}
