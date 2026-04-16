import { computed, inject, Injectable, signal } from '@angular/core';
import { MealDefinitionStateService } from '../state/mealDefinition.service';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { FormControl } from '@angular/forms';
import { MealCategoryDomainFacade } from '../../../domain-facades/mealCategory.facade';
import { RecipeDomainFacade } from '../../../domain-facades/recipe.facade';
import { MealStateService } from '../state/meal.service';

@Injectable({ providedIn: 'root' })
export class MealDefinitionFacade {
  /* ════════════════════════════════
   * Constants
   * ════════════════════════════════ */
  readonly nbMeals = Array.from({ length: 14 }, (_, i) => i + 1);

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */

  /** Public UI methods */
  public initializeMealNbControl(control: FormControl) {
    //Initialize control from signal
    control.setValue(this.plannedMealsCount());

    // Update view when user changes selection
    control.valueChanges.subscribe((val) => {
      if (val !== null) this.updatePlannedMealsCount(val);
    });
  }

  public toggleSelection(category: RecipeCategoryDocInBackend) {
    const current = this.selectedCategories();
    const exists = current.some((c) => c.id === category.id);

    const updated = exists
      ? current.filter((c) => c.id !== category.id)
      : [...current, category];

    this.selectedCategories.set(updated);
  }

  public proceed() {
    const test1 = this.defService.state().mealCategoriesSelected;
    console.log('BEFORE mealCategoriesSelected: ', test1);

    this.defService.saveMealCategories(this.selectedCategories());
    this.mealService.updateProperty('currentNavStep', 2);

    const test2 = this.defService.state().mealCategoriesSelected;
    console.log('AFTER mealCategoriesSelected: ', test2);
  }

  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private mealCategoryDomainFacade = inject(MealCategoryDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);

  /** Transitional state (shared by several ui) */
  private defService = inject(MealDefinitionStateService);
  private mealService = inject(MealStateService);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  readonly selectedCategories = signal<RecipeCategoryDocInBackend[]>([]);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  private mealCategoriesLoading =
    this.mealCategoryDomainFacade.mealCategoriesLoading;
  private mealCategories = this.mealCategoryDomainFacade.dbMealCategories;
  private recipes = this.recipeDomainFacade.dbRecipes;

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  readonly plannedMealsCount = computed(() => {
    return this.defService.state().plannedMealsCount;
  });

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return (
      this.mealCategoriesLoading() || this.filteredCategories().length === 0
    );
  });

  readonly selectedCategoriesIds = computed(() =>
    this.selectedCategories().map((c) => c.id),
  );

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
  /** Meal category ids for all available recipes */
  readonly filteredCategories = computed(() => {
    const categories = this.mealCategories();
    const recipes = this.recipes();

    // Whenever the data has not loaded yet
    if (!categories.length || !recipes.length) return [];

    // Retrieve all (unique) meal category ids of stored recipes
    const recipesMealCategoryIds = new Set(
      recipes.map((r) => r.mealCategoryId),
    );

    console.log('recipesMealCategoryIds: ', recipesMealCategoryIds);
    return categories.filter((cat) => recipesMealCategoryIds.has(cat.id));
  });

  readonly applyProceedButtonDisableClass = computed(
    () =>
      this.filteredCategories().length === 0 ||
      this.selectedCategories().length === 0,
  );

  readonly proceedButtonIsDisabled = computed(
    () => this.selectedCategories().length === 0,
  );

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  private updatePlannedMealsCount(count: number | null) {
    if (count !== null) {
      this.defService.savePlannedMealsCount(count);
    }
  }
}
