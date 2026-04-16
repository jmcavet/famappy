import {
  computed,
  ElementRef,
  inject,
  Injectable,
  Signal,
} from '@angular/core';
import { Meal, MealWithId } from '../../state/mealCart.model';
import { MemberWithId } from '../../../members/components/member/member.model';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealCartStateService } from '../../state/mealCart.service';

@Injectable({ providedIn: 'root' })
export class MealCookSelectionFacade {
  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/
  /** Transitional state (shared by several ui) */
  private cartService = inject(MealCartStateService);

  /* ================================
   * Local UI state (owned by this facade)
   * ================================ */
  /** Other dependency injections */
  private _el = inject(ElementRef);

  /** Private properties passed from the component */
  private _selectedDay!: Signal<CalendarDay>;
  private _mealType: string = 'lunch';
  private _dailyMealPerMealType!: Signal<MealWithId[]>;
  private _parents!: Signal<MemberWithId[]>;
  private _cookName!: Signal<string>;

  connect(
    selectedDay: Signal<CalendarDay>,
    mealType: string,
    dailyMealPerMealType: Signal<MealWithId[]>,
    parents: Signal<MemberWithId[]>,
    cookName: Signal<string>,
  ) {
    this._selectedDay = selectedDay;
    this._mealType = mealType;
    this._dailyMealPerMealType = dailyMealPerMealType;
    this._parents = parents;
    this._cookName = cookName;
  }

  /** Computed signals */
  readonly finalCart = computed<Meal[]>(
    () => this.cartService.state().finalCart,
  );

  readonly canAssignCook = computed(() => {
    const mealsFromBackend = this._dailyMealPerMealType();
    if (mealsFromBackend && mealsFromBackend?.length > 0) {
      return true;
    }

    const mealsMovedToSummarySection = this.finalCart().filter(
      (obj) =>
        obj.weekDay.dayName === this._selectedDay().dayName &&
        obj.mealType === this._mealType,
    );
    return mealsMovedToSummarySection.length > 0;
  });

  readonly cookIsFirstParent = computed(() => {
    return (
      this._parents().findIndex(
        (parent) => parent.name === this._cookName(),
      ) === 0
    );
  });

  readonly cookPosition: Signal<string> = computed(() => {
    const cookIndex = this._parents().findIndex(
      (parent) => parent.name === this._cookName(),
    );

    if (!this._cookName()) {
      return 'none';
    }

    if (cookIndex === 0) {
      return 'first';
    }
    return 'second';
  });
}
