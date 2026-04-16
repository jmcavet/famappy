import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { Meal } from '../../state/mealCart.model';
import { MealCartStateService } from '../../state/mealCart.service';
import { getWeekDays } from '../../../../shared/utils/calendar';
import { MealDomainFacade } from '../../../../domain-facades/meal.facade';
import { MemberDomainFacade } from '../../../../domain-facades/member.facade';

export interface CalendarDay {
  dayName: string;
  dayOfMonth: number;
  monthName: string;
  year: number;
}

export interface CalendarDayWithCooks extends CalendarDay {
  cooks: string[];
}

@Injectable({ providedIn: 'root' })
export class CalendarFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */

  /** Domain access (business state & actions) */
  private mealDomainFacade = inject(MealDomainFacade);
  private memberDomainFacade = inject(MemberDomainFacade);

  /** Transitional state */
  private cartService = inject(MealCartStateService);

  /* ================================
   * UI state (owned by this facade)
   * ================================ */

  /** Internal signals */
  private readonly dbMeals = this.mealDomainFacade.dbMeals;
  private readonly mealsLoading = this.mealDomainFacade.mealsLoading;
  private readonly membersLoading = this.memberDomainFacade.membersLoading;

  readonly dbMembers = this.memberDomainFacade.dbMembers;
  readonly parentNames = this.memberDomainFacade.parentNames;

  public readonly weekDays = signal<CalendarDay[]>([]);
  private readonly _selectedDay = signal<CalendarDay>(
    this.cartService.state().selectedDay,
  );

  /** Public signals (used/rendered on UI) */
  readonly selectedDay = this._selectedDay.asReadonly();

  /* ================================
   * Computed signals
   * ================================ */

  /** Private signals */
  private readonly finalCart = computed<Meal[]>(
    () => this.cartService.state().finalCart,
  );

  /** Public signals (rendered on UI) */
  readonly weekDaysWithMeals = computed(() => {
    return this.finalCart().map((cart) => cart.weekDay.dayName);
  });

  readonly dataLoading = computed(
    () => this.membersLoading() || this.mealsLoading(),
  );

  readonly calendarDaysWithCooks: Signal<CalendarDayWithCooks[]> = computed(
    () => {
      return this.weekDays().map((weekDay) => {
        const meals = this.dbMeals().filter((meal) => {
          const mealWeekDay = meal.weekDay;
          return (
            mealWeekDay.dayName === weekDay.dayName &&
            mealWeekDay.dayOfMonth === weekDay.dayOfMonth &&
            mealWeekDay.monthName === weekDay.monthName &&
            mealWeekDay.year === weekDay.year
          );
        });

        // Sort meals so that those for lunch comes before those for dinner. Hence,
        // the first cook to appear at the bottom of each calendar card will be for the one
        // preparing the meal for lunch.
        meals.sort((a, b) => {
          if (a.mealType === b.mealType) return 0;

          return a.mealType === 'lunch' ? -1 : 1;
        });

        // Define the cooks (members' names)
        const cookIds = meals.flatMap((obj) => obj.cookId);
        const uniqueCookIds = [...new Set(cookIds)];

        let uniqueCooks = uniqueCookIds.map((id) => {
          const member = this.dbMembers().find((m) => m.id === id);

          return member?.name ?? null;
        });

        let cooks: any;
        cooks = uniqueCooks.length > 0 ? uniqueCooks : [];

        return {
          dayName: weekDay.dayName,
          dayOfMonth: weekDay.dayOfMonth,
          monthName: weekDay.monthName,
          year: weekDay.year,
          cooks,
        };
      });
    },
  );

  /* ================================
   * Methods
   * ================================ */

  /** Public UI methods */
  initialize() {
    const weekDays = getWeekDays();
    this.weekDays.set(weekDays);

    // Activate the first day of the calendar, only if no day has been yet selected
    const currentDaySelected = this.cartService.state().selectedDay;

    if (currentDaySelected.dayName.length === 0) {
      const firstDay = weekDays[0];
      this.toggleDay(firstDay);
    } else {
      this._selectedDay.set(currentDaySelected);
    }
  }

  toggleDay(day: CalendarDay) {
    this._selectedDay.set(day);

    this.cartService.updateProperty('selectedDay', day);
  }
}
