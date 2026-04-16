import {
  computed,
  effect,
  ElementRef,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';
import { MealBackendService } from '../../../../services/backend/meal.service';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { ModalService } from '../../../../shared/modal/modal.service';

@Injectable({ providedIn: 'root' })
export class ManualEntryFacade {
  private _dailyMealPlan!: Signal<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>;

  private _mealType!: Signal<MealType>;

  private _modalService!: ModalService;

  /* ================================
   * Dependencies (injected)
   * ================================ */

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);

  private mealBackendService = inject(MealBackendService);

  /** Transitional state */

  /* ================================
   * UI state (owned by this facade)
   * ================================ */

  /** Public signals (used/rendered on UI) */
  readonly ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;
  readonly dbIngredients = this.ingredientDomainFacade.dbIngredients;
  readonly dbIngredientsNames = this.ingredientDomainFacade.dbIngredientsNames;

  constructor() {
    effect(() => {
      const ingredientSearched = this.ingredientSearched();

      if (!ingredientSearched) return;

      this.onIngredientChanged(ingredientSearched);
    });
  }

  /** called by the component */
  connect(
    dailyMealPlan: Signal<{
      weekDay: CalendarDay;
      recipes: MealWithId[];
    }>,
    mealType: Signal<MealType>,
    modalService: ModalService,
  ) {
    this._dailyMealPlan = dailyMealPlan;
    this._mealType = mealType;
    this._modalService = modalService;
  }

  /** Internal signals */

  /* ================================
   * Component inputs (UI context)
   * ================================ */
  public mealDescription = signal('');
  public ingredients = signal<{ name: string; fromDb: boolean }[]>([]);
  public ingredientSearched = signal('');
  public suggestedIngredients = signal<string[]>([]);
  public ingredientFromDb = signal<boolean>(false);
  public createAnother = signal(false);

  private wasModalPreviouslyOpen = false;

  /* ================================
   * Computed signals
   * ================================ */

  /** Public signals (rendered on UI) */

  /* ================================
   * Methods
   * ================================ */

  /** Private methods */
  private onIngredientChanged(value: string) {
    if (value.length < 3) {
      this.suggestedIngredients.update(() => []);
      return;
    }

    const ingredientsFound = this.dbIngredientsNames().filter(
      (ingredientName) =>
        ingredientName.toLowerCase().includes(value.toLowerCase()),
    );

    if (ingredientsFound.length === 0) return;

    this.suggestedIngredients.update(() => ingredientsFound);
  }

  /** Public UI methods */
  public selectSuggestedIngredient(suggestedIngredient: string) {
    this.ingredientSearched.set(suggestedIngredient);
    this.ingredientFromDb.update(() => true);
    this.addIngredient();
    this.suggestedIngredients.update(() => []);
    this.ingredientSearched.update(() => '');

    // Reset to default (false)
    this.ingredientFromDb.update(() => false);
  }

  public toggleCreateAnother() {
    this.createAnother.update(() => !this.createAnother());
  }

  public addIngredient() {
    this.ingredients.update((previous) => [
      ...previous,
      { name: this.ingredientSearched(), fromDb: this.ingredientFromDb() },
    ]);

    this.ingredientSearched.update(() => '');
  }

  public removeIngredient(index: number) {
    this.ingredients.update((arr) => arr.filter((el, i) => i !== index));
  }

  public async onConfirm() {
    const weekDay = this._dailyMealPlan().weekDay;
    const mealType = this._mealType();

    const recipesPerTypeSelected = this._dailyMealPlan().recipes.filter(
      (r) => r.mealType === mealType,
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
        : mealType === 'lunch'
          ? 2
          : 4;
    }

    // If no cook has been previously defined for the meals of this specific
    // day & meal type, set it to null, otherwise select the cook of the first available meal.
    const cookId = recipesPerTypeSelected[0]?.cookId ?? null;

    try {
      const mealToSave = {
        weekDay,
        recipe: null,
        mealType,
        servings,
        cookId,
        manualRecipe: {
          name: this.mealDescription(),
          ingredients: this.ingredients().map((ing) => ing.name),
        },
      };
      const mealIds = await this.mealBackendService.saveMealsIntoStore([
        mealToSave,
      ]);

      if (!mealIds) throw new Error('No meal IDs returned');
    } catch (error) {
      console.log('SOME ERROR WHILE SAVING MEALS: ', error);
    } finally {
      this.resetUi();

      if (!this.createAnother()) {
        this._modalService.confirm();
      }
    }
  }

  // ngAfterViewChecked is called after each change detection
  ngAfterViewChecked(inputRef: ElementRef<HTMLInputElement>) {
    // Focus the input only when modal just opened
    if (this._modalService.isOpen() && !this.wasModalPreviouslyOpen) {
      // SetTimeout avoids timing issues when rendering elements
      setTimeout(() => inputRef?.nativeElement?.focus());
    }
    // Focus only happens when modal transitions from closed to open
    this.wasModalPreviouslyOpen = this._modalService.isOpen();
  }

  public cancel() {
    this.resetUi();
    this._modalService.cancel();
  }

  /** Private methods */
  private resetUi() {
    this.mealDescription.update(() => '');
    this.ingredientSearched.update(() => '');
    this.suggestedIngredients.update(() => []);
    this.ingredients.update(() => []);
  }
}
