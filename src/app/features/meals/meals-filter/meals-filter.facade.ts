import { computed, effect, inject, Injectable } from '@angular/core';
import { MealDefinitionStateService } from '../state/mealDefinition.service';
import {
  CuisineDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { MealFilterStateService } from '../state/mealFilter.service';
import { Difficulty, Frequency, Season } from '../state/mealFilter.model';
import { RecipeDomainFacade } from '../../../domain-facades/recipe.facade';
import { RecipeCategoryDomainFacade } from '../../../domain-facades/recipeCategory.facade';
import { CuisineDomainFacade } from '../../../domain-facades/cuisine.facade';

@Injectable({ providedIn: 'root' })
export class MealFilterFacade {
  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */

  /** Public UI methods */
  public selectSeason(seasonSelected: Season) {
    this.filterService.setSeason(seasonSelected);
    this.filterService.computeRecipesFiltered(this.recipesFiltered());
  }

  public selectCuisine(cuisineSelected: CuisineDocInBackend) {
    this.filterService.setCuisine(cuisineSelected);

    this.filterService.computeRecipesFiltered(this.recipesFiltered());
  }

  public selectDifficulty(difficultySelected: Difficulty) {
    this.filterService.setDifficulty(difficultySelected);

    this.filterService.computeRecipesFiltered(this.recipesFiltered());
  }

  public selectFrequency(frequencySelected: Frequency) {
    this.filterService.setFrequency(frequencySelected);

    this.filterService.computeRecipesFiltered(this.recipesFiltered());
  }

  public toggleRecipeCategory(
    recipeCategorySelected: RecipeCategoryDocInBackend,
  ) {
    this.filterService.setRecipeCategory(recipeCategorySelected);

    this.filterService.computeRecipesFiltered(
      this.recipesFiltered(),
      this.recipeCategoryMode(),
    );
  }

  public toggleRecipeCategoryMode(position: number) {
    this.filterService.state.update((state) => ({
      ...state,
      recipeCategoryMode: position,
    }));

    this.filterService.computeRecipesFiltered(this.recipesFiltered(), position);
  }

  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private recipeDomainFacade = inject(RecipeDomainFacade);
  private recipeCategoryDomainFacade = inject(RecipeCategoryDomainFacade);
  private cuisineDomainFacade = inject(CuisineDomainFacade);

  /** Transitional state (shared by several ui) */
  private defService = inject(MealDefinitionStateService);
  private filterService = inject(MealFilterStateService);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  private recipes = this.recipeDomainFacade.dbRecipes;
  private recipesLoading = this.recipeDomainFacade.recipesLoading;
  private recipeCategories = this.recipeCategoryDomainFacade.dbRecipeCategories;
  private recipeCategoriesLoading =
    this.recipeCategoryDomainFacade.recipeCategoriesLoading;
  private cuisines = this.cuisineDomainFacade.dbCuisines;
  private cuisinesLoading = this.cuisineDomainFacade.cuisinesLoading;

  constructor() {
    // 1. Initialize the 'recipesFiltered' property of the meal filter state
    effect(() => {
      const recipes = this.recipesFiltered();

      if (!recipes.length) {
        console.log('No recipes available: ', recipes);
        return;
      }

      this.filterService.filterRecipes(recipes);
    });
  }

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  readonly seasonsSelected = computed<Season[]>(
    () => this.filterService.state().seasonsSelected,
  );
  readonly difficultiesSelected = computed<Difficulty[]>(
    () => this.filterService.state().difficultiesSelected,
  );
  readonly cuisinesSelected = computed<any[]>(
    () => this.filterService.state().cuisinesSelected,
  );
  readonly frequenciesSelected = computed<Frequency[]>(
    () => this.filterService.state().frequenciesSelected,
  );
  readonly selectedCategoryIds = computed<Set<string>>(() => {
    return new Set(this.filterService.state().recipeCategoryIds);
  });
  readonly nbRecipesFiltered = computed<number>(
    () => this.filterService.state().recipesFiltered.length,
  );

  readonly recipeCategoryMode = computed<number>(
    () => this.filterService.state().recipeCategoryMode,
  );

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return (
      this.cuisinesLoading() ||
      this.recipeCategoriesLoading() ||
      this.recipesLoading()
    );
  });

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
  // Return all recipes which meal categories correspond to those previously selected by users
  private recipesFiltered = computed(() => {
    return this.recipes().filter((r) =>
      this.mealCategoriesIdsSelected().includes(r.mealCategoryId),
    );
  });

  // List of available options that are being displayed as tags for each section (cuisine, difficulty, season, etc.)
  readonly cuisineOptions = computed(() => {
    const recipes = this.recipesFiltered();
    const cuisines = this.cuisines();

    if (!recipes.length) return [];

    const cuisineIds = [...new Set(recipes.map((r) => r.cuisineId))];

    return cuisines.filter((c) => cuisineIds.includes(c.id));
  });

  readonly difficultyOptions = computed(() => {
    return [...new Set(this.recipesFiltered().map((r) => r.difficulty))];
  });

  readonly seasonOptions = computed(() => {
    return [
      ...new Set(this.recipesFiltered().flatMap((r) => r.seasonsSelected)),
    ];
  });

  readonly frequencyOptions = computed(() => {
    return [...new Set(this.recipesFiltered().map((r) => r.frequency))];
  });

  readonly recipeCategoryOptions = computed(() => {
    if (!this.recipesFiltered().length) return [];

    const categoryIds = [
      ...new Set(this.recipesFiltered().flatMap((r) => r.recipeCategoryIds)),
    ];

    return this.recipeCategories().filter((c) => categoryIds.includes(c.id));
  });

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  // Return the ids of the meal categories previously selected by users
  private mealCategoriesIdsSelected = computed(() => {
    return this.defService.state().mealCategoriesSelected.map((obj) => obj.id);
  });
}
