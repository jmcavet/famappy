import { computed, inject, Injectable, signal } from '@angular/core';
import { RecipeStateService } from '../../services/state/recipe.service';
import { Location } from '@angular/common';
import { IngredientDomainFacade } from '../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';

@Injectable()
export class IngredientsFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Framework dependencies */
  private location = inject(Location);

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbIngredients = this.ingredientDomainFacade.dbIngredients;
  readonly ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;

  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  readonly ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  constructor() {
    /** Whenever users click on the back button (left arrow in header), they want to go back
     * to the 'ingredients' tab (and not back to the 'definition' tab). We must preserve the state once
     * the component has been initialized.
     */
    this.recipeService.preserveState(true);
  }

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  inputText = signal<string>('');
  ingredientCategoryNameSelected = signal<string>('');

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly pageIsLoading = computed(
    () => this.ingredientsLoading() || this.ingredientCategoriesLoading(),
  );

  readonly ingredientCategoriesNames = computed(() =>
    // Sort categories alphabetically
    this.dbIngredientCategories()
      .map((cat) => cat.name)
      .sort((a, b) => a.localeCompare(b)),
  );

  /** Define the ingredients filtered by the text entered by user and/or by ingredient category selected */
  readonly ingredientsFiltered = computed(() => {
    const ingredients = this.dbIngredients().map((ingredient) => {
      const categoryName =
        this.dbIngredientCategories().find(
          (t) => t.id === ingredient.categoryId,
        )?.name || '';
      return { ...ingredient, categoryName };
    });

    const ingredientsFilteredBySearch = ingredients.filter((ingredient) => {
      return this.ingredientCategoryNameSelected().length === 0
        ? ingredient.name.toLowerCase().includes(this.inputText().toLowerCase())
        : ingredient.name
            .toLowerCase()
            .includes(this.inputText().toLowerCase()) &&
            ingredient.categoryName === this.ingredientCategoryNameSelected();
    });

    // Sort names alphabetically
    return ingredientsFilteredBySearch.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  resetInput() {
    this.inputText.set('');
  }

  selectIngredientCategoryName(ingredientCategoryName: string) {
    this.ingredientCategoryNameSelected.set(
      ingredientCategoryName === this.ingredientCategoryNameSelected()
        ? ''
        : ingredientCategoryName,
    );
  }

  selectIngredient(ingredientId: string) {
    this.recipeService.selectIngredient(ingredientId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }
}
