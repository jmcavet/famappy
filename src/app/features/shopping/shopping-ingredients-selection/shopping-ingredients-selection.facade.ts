import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { IngredientDomainFacade } from '../../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../../domain-facades/ingredientCategory.facade';
import { ShoppingStateService } from '../../meals/state/shopping.service';
import { RecipeDomainFacade } from '../../../domain-facades/recipe.facade';

interface IngredientDisplay {
  id: string;
  name: string;
  measure: number;
  unit: string;
}

@Injectable({ providedIn: 'root' })
export class ShoppingIngredientsSelectionFacade {
  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );
  private recipeDomainFacade = inject(RecipeDomainFacade);

  /** Transitional state (shared by several ui) */
  private shoppingService = inject(ShoppingStateService);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  readonly selectedRecipes = signal<RecipeWithId[]>([]);
  readonly showIngredientCategories = signal<boolean>(false);
  readonly ingredientsDisabled = signal<string[]>([]);
  readonly initialMeasures = signal<{ id: string; measure: number }[]>([]);

  /** Private signals */

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  private ingredients = this.ingredientDomainFacade.dbIngredients;
  private ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;
  private ingredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  private ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;
  private dbRecipes = this.recipeDomainFacade.dbRecipes;

  constructor() {
    // Set ingredient category once categories are loaded
    effect(() => {
      const ingredientCategories = this.ingredientCategories();
      const selected = this.ingredientCategoryIdSelected();

      if (!selected && ingredientCategories.length > 0) {
        this.shoppingService.setIngredientCategory(ingredientCategories[0]);
      }
    });

    // Initialise the ingredient measures from DB once, only if state is empty
    effect(() => {
      const ingredients = this.allIngredientsFiltered();

      if (ingredients.length > 0 && this.measures().length === 0) {
        const measures = ingredients.map((ing) => ({
          id: ing.id,
          measure: ing.measure,
        }));

        this.shoppingService.initialiseMeasures(measures);

        this.initialMeasures.set(measures);
      }
    });
  }

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  // States from the Shopping pages
  readonly shoppingMealsSelected = computed(
    () => this.shoppingService.state().shoppingMealsSelected,
  );

  readonly ingredientCategoryIdSelected = computed(
    () => this.shoppingService.state().ingredientCategoryIdSelected,
  );

  readonly measures = computed(() => {
    return this.shoppingService.state().measures;
  });

  readonly nbMeasuresToExport = computed(
    () => this.measures().filter((measure) => measure.measure > 0).length,
  );

  readonly units = computed(() => {
    return this.shoppingService.state().units;
  });

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return (
      this.ingredientsLoading() ||
      this.ingredientCategoriesLoading() ||
      this.ingredientCategoriesSelected().length === 0
    );
  });

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
  readonly recipesSelected = computed(() => {
    const recipesSelected = this.dbRecipes().filter((recipe) => {
      const recipeIds = this.shoppingMealsSelected().map(
        (meal) => meal.recipe.recipe?.id,
      );

      return recipeIds.includes(recipe.id);
    });

    return recipesSelected;
  });

  readonly allIngredientsFiltered = computed(() => {
    // For each recipe/meal selected, get its unique list of ingredients (some recipes may have common ingredients)
    const ingredientsFromRecipesSelection = this.recipesSelected().flatMap(
      (recipe: RecipeWithId) => recipe.ingredients,
    );
    const uniqueIngredientsFromRecipesSelection = [
      ...new Set(ingredientsFromRecipesSelection),
    ];

    const unique = [
      ...new Map(
        uniqueIngredientsFromRecipesSelection.map((item) => [item.id, item]),
      ).values(),
    ];

    return unique;
  });

  readonly ingredientsSelectedSorted = computed(() => {
    // For each recipe/meal selected, get its unique list of ingredients (some recipes may have common ingredients)
    const ingredientsFromRecipesSelection = this.recipesSelected().flatMap(
      (recipe: RecipeWithId) => recipe.ingredients,
    );
    const uniqueIngredientsFromRecipesSelection = [
      ...new Set(ingredientsFromRecipesSelection),
    ];

    // Filter only those unique ingredients that correspond to the ingredient category selected (e.g. fruit or vegetable)
    const ingredientsPerCategorySelected =
      uniqueIngredientsFromRecipesSelection.filter((ing) => {
        const ingredientSearched = this.ingredients().find(
          (ingr) => ingr.id === ing.id,
        );
        const ingredientCategorySearched = this.ingredientCategories().find(
          (cat) => cat.id === ingredientSearched?.categoryId,
        );

        return (
          ingredientCategorySearched?.id === this.ingredientCategoryIdSelected()
        );
      });

    const uniqueIngredientsPerCategorySelected = [
      ...new Map(
        ingredientsPerCategorySelected.map((item) => [item.id, item]),
      ).values(),
    ];

    const sortedIngredientsPerCategorySelected = [
      ...new Set(uniqueIngredientsPerCategorySelected),
    ].sort((a, b) => a.name.localeCompare(b.name));

    return sortedIngredientsPerCategorySelected.map((ing) => {
      // For each ingredient displayed (for 1 specific category selected, e.g. fruit), get the only the recipes selected that contain this ingredient
      const recipesContainingIngredient = this.recipesSelected().filter(
        (recipe) => {
          const recipeIngredientsIds = recipe.ingredients.flatMap(
            (ingr) => ingr.id,
          );

          return recipeIngredientsIds.includes(ing.id);
        },
      );

      // From those filtered recipes, get the searched ingredients and their properties (id, name, measure, unit)
      const ingredientsFiltered = recipesContainingIngredient.flatMap(
        (recipe) => {
          const ingredients = recipe.ingredients;
          const ingredientsSearched = ingredients.filter(
            (ingr) => ingr.id === ing.id,
          );

          return ingredientsSearched;
        },
      );

      // Retrieve the unit and sum of measure (1 ingredient may be used multiple times, with the same unit -e.g. 'g'- but eventually with different measures -e.g. 200, 320-)
      const ingredientUnit = ingredientsFiltered.map((ing) => ing.unit);
      const ingredientMeasure = ingredientsFiltered.map((ing) => ing.measure);
      const sumMeasure = ingredientMeasure.reduce(
        (acc, val) => acc + Number(val),
        0,
      );

      return {
        id: ing.id,
        name: ing.name,
        measure: sumMeasure ?? '',
        unit: ingredientUnit[0],
      } satisfies IngredientDisplay;
    });
  });

  readonly ingredientCategoriesSelected = computed(() => {
    // Get all ingredients IDs belonging to each selected recipe
    const ingredientsPerRecipes = this.recipesSelected().flatMap(
      (recipe: any) => recipe.ingredients,
    );
    const uniqueIngredientsPerRecipes = [...new Set(ingredientsPerRecipes)];

    const ingredientIds = uniqueIngredientsPerRecipes.flatMap((ing) => ing.id);
    const uniqueIngredientIds = [...new Set(ingredientIds)];

    // From the IDs, get the original (filtered) ingredients
    const ingredientsFiltered = this.ingredients().filter((ing) =>
      uniqueIngredientIds.includes(ing.id),
    );

    // Get all Ingredient Category IDs corresponding to each of those ingredients
    const filteredIngredientCategoryIds = ingredientsFiltered.map(
      (ing) => ing.categoryId,
    );

    // Find the ingredient categories by their IDs
    const selectedIngredientCategories = this.ingredientCategories().filter(
      (ing) => filteredIngredientCategoryIds.includes(ing.id),
    );

    // Return the sorted names of the ingredient categories
    return selectedIngredientCategories
      .map((cat) => cat.name)
      .sort((a, b) => a.localeCompare(b));
  });

  readonly ingredientCategoryNameSelected = computed(() => {
    const ingredientCategorySelected = this.ingredientCategories().find(
      (cat) =>
        cat.id === this.shoppingService.state().ingredientCategoryIdSelected,
    );

    return ingredientCategorySelected?.name ?? null;
  });

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  changeMeasure(ingredientId: string, value: 'decr' | 'incr') {
    const currMeasure =
      this.measures().find((m) => m.id === ingredientId)?.measure ?? 0;

    const ingredient = this.ingredients().find(
      (ing) => ing.id === ingredientId,
    );

    const ingredientUnit = ingredient?.unit ?? null;
    const refMeasure = ingredient?.measure ?? 0;

    let newMeasure;
    if (ingredientUnit === null) {
      // For measures without unit
      newMeasure = value === 'decr' ? currMeasure - 1 : currMeasure + 1;
    } else {
      if (value === 'decr' && currMeasure !== 0) {
        newMeasure = Math.max(
          0,
          Math.ceil(currMeasure / refMeasure) * refMeasure - refMeasure,
        );
      } else {
        newMeasure =
          Math.floor(currMeasure / refMeasure) * refMeasure + refMeasure;
      }
    }

    this.shoppingService.changeMeasure(ingredientId, newMeasure);
  }

  disableIngredient(ingredientId: string) {
    if (this.ingredientsDisabled().includes(ingredientId)) {
      this.ingredientsDisabled.update((previous) =>
        previous.filter((id) => id !== ingredientId),
      );

      // Reset the measure to its original value
      const originalMeasure = this.initialMeasures().find(
        (measure) => measure.id === ingredientId,
      )?.measure;

      if (originalMeasure) {
        this.shoppingService.changeMeasure(ingredientId, originalMeasure);
      }
    } else {
      this.shoppingService.changeMeasure(ingredientId, 0);

      this.ingredientsDisabled.update((previous) => [
        ...previous,
        ingredientId,
      ]);
    }
  }

  toggleIngredientCategory(ingredientCategoryName: string) {
    const ingredientCategory = this.ingredientCategories().find(
      (cat) => cat.name === ingredientCategoryName,
    );
    if (ingredientCategory) {
      this.shoppingService.setIngredientCategory(ingredientCategory);
    }
  }

  measureFor = (ingredientId: string): number => {
    const fromState = this.measures().find(
      (m) => m.id === ingredientId,
    )?.measure;

    if (fromState !== undefined) {
      return fromState;
    }

    // Fallback to the value from the database
    const fromDb =
      this.ingredientsSelectedSorted().find((ing) => ing.id === ingredientId)
        ?.measure ?? 0;

    return fromDb;
  };

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
}
