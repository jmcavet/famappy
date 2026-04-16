import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { MealCartStateService } from '../../state/mealCart.service';
import {
  MealDocWithIdInBackend,
  MealType,
  MealWithId,
} from '../../state/mealCart.model';
import { DayServings } from '../../meals-cart/meals-cart.facade';
import { CalendarDay } from '../calendar/calendar.facade';
import { MemberDomainFacade } from '../../../../domain-facades/member.facade';
import { MealBackendService } from '../../../../services/backend/meal.service';

@Injectable({ providedIn: 'root' })
export class MealTypeHeaderFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */

  /** Domain access (business state & actions) */
  private memberDomainFacade = inject(MemberDomainFacade);

  private mealBackendService = inject(MealBackendService);
  readonly mealsLoading: Signal<boolean> = this.mealBackendService.loading;
  readonly dbMeals: Signal<MealDocWithIdInBackend[]> =
    this.mealBackendService.meals;

  /** Transitional state */
  private cartService = inject(MealCartStateService);

  /* ================================
   * UI state (owned by this facade)
   * ================================ */

  /** Public signals (used/rendered on UI) */
  readonly membersAreLoaded = this.memberDomainFacade.membersAreLoaded;

  /** Internal signals */
  private readonly parents = this.memberDomainFacade.parents;
  private readonly children = this.memberDomainFacade.children;
  private readonly dayServings = signal<DayServings[]>(
    [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ].map((dayName) => ({
      dayName,
      servings: 2, // default
    })),
  );

  /* ================================
   * Component inputs (UI context)
   * ================================ */
  mealType!: MealType;
  private dailyMealPerMealType!: Signal<MealWithId[]>;

  /** Called by the component */
  connect(mealType: MealType, dailyMealPerMealType: Signal<MealWithId[]>) {
    this.mealType = mealType;
    this.dailyMealPerMealType = dailyMealPerMealType;
  }

  initialized = false;

  constructor() {
    effect(() => {
      if (this.initialized) return;

      // Wait until data is loaded
      if (this.memberDomainFacade.membersAreNotYetRetrieved()) return;

      this.initialized = true;

      this.initServings(this.mealType);
    });
  }

  /* ================================
   * Computed signals
   * ================================ */

  /** Public signals (rendered on UI) */
  readonly selectedDay = computed<CalendarDay>(
    () => this.cartService.state().selectedDay,
  );

  readonly uiServings = computed(() => {
    return (
      this.cartService.getMealServings(this.mealType) ??
      this.dayServings().find((d) => d.dayName === this.selectedDay().dayName)
        ?.servings ??
      2
    );
  });

  readonly uiCookName = computed(() => {
    // USE CASE A: /meals page
    // -----------------------
    // Check if meals come from the database. If so, take the first one available and get its cook's name
    if (this.dailyMealPerMealType().length > 0) {
      const cookId = this.dailyMealPerMealType()[0].cookId ?? 'TOTO';
      return this.parents().find((parent) => parent.id === cookId)?.name ?? '';
    }

    // USE CASE B: /meals/cart page
    // ----------------------------
    // If not, get the cook name from the application state
    const cookId = this.cartService.getCookId(this.mealType) ?? '';
    return this.parents().find((parent) => parent.id === cookId)?.name ?? '';
  });

  /* ================================
   * Methods
   * ================================ */

  /** Private methods */
  private initServings(mealType: MealType) {
    this.mealType = mealType;

    const parents = this.parents();
    const children = this.children();

    this.dayServings.update((days) =>
      days.map((day) => {
        const isWeekend =
          day.dayName === 'saturday' || day.dayName === 'sunday';

        const servings = isWeekend
          ? parents.length + children.length
          : mealType === 'lunch'
            ? parents.length
            : parents.length + children.length;

        return { ...day, servings };
      }),
    );
  }

  private removeRecipes() {
    // Remove the recipes selected within the cart page from the cart
    this.cartService.removeRecipesFromCart();

    this.cartService.resetSelectedRecipes();
  }

  /** Public UI methods */
  public allocateRecipesToWeekDay() {
    const { dayName, dayOfMonth, monthName, year } = this.selectedDay();

    const toto = this.dbMeals().filter((meal) => {
      return (
        meal.weekDay.dayName === dayName &&
        meal.weekDay.dayOfMonth === dayOfMonth &&
        meal.weekDay.monthName === monthName &&
        meal.weekDay.year === year &&
        meal.mealType === this.mealType
      );
    });

    this.cartService.allocateRecipesToWeekDay(
      this.mealType,
      this.uiServings(),
      toto[0]?.cookId ?? null,
    );

    this.removeRecipes();
  }

  decreaseServings() {
    this.cartService.decreaseServings(this.mealType);
  }

  increaseServings() {
    this.cartService.increaseServings(this.mealType);
  }
}
