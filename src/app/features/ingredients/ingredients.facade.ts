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

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly pageIsLoading = computed(
    () => this.ingredientsLoading() || this.ingredientCategoriesLoading(),
  );

  readonly IngredientCategoriesNames = computed(() =>
    this.dbIngredientCategories().map((cat) => cat.name),
  );

  readonly ingredientCategoryNameSelected = computed(() => {
    // const toto = this.mealCategories().find(
    //   (cat) => cat.id === this.selectionService.state().mealCategoryIdSelected,
    // );
    // if (toto) {
    //   return toto.name;
    // }
    return 'NOTHING!!';
  });

  /** Define the ingredients filtered by the text entered by user */
  readonly ingredientsFiltered = computed(() => {
    const ingredients = this.dbIngredients().map((ingredient) => {
      const typeName =
        this.dbIngredientCategories().find(
          (t) => t.id === ingredient.categoryId,
        )?.name || '';
      return { ...ingredient, typeName };
    });

    const ingredientsFilteredBySearch = ingredients.filter((ingredient) => {
      return ingredient.name
        .toLowerCase()
        .includes(this.inputText().toLowerCase());
    });

    return ingredientsFilteredBySearch;
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  resetInput() {
    this.inputText.set('');
  }

  public toggleIngredientCategory(ingredientCategoryName: string) {
    // const ingredientCategory = this.ingredientCategories().find(
    //   (cat) => cat.name === ingredientCategoryName,
    // );
    // if (ingredientCategory) {
    //   this.selectionService.setMealCategory(mealCategory);
    // }
    console.log('ingredientCategoryName: ', ingredientCategoryName);
  }

  selectIngredient(ingredientId: string) {
    this.recipeService.selectIngredient(ingredientId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }
}
