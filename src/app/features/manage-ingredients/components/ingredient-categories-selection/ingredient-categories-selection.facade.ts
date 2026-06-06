import { computed, inject, Injectable, signal } from '@angular/core';
import { IngredientCategoryDomainFacade } from '../../../../domain-facades/ingredientCategory.facade';
import { IngredientType } from '../../../../models/ingredient-type.model';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';

@Injectable()
export class IngredientCategoriesSelectionFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Framework dependencies */

  /** Domain access (business state & actions) */
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /* ================================
   * Domain-derived state
   * ================================ */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  ingredientCategorySelected = signal<IngredientType | undefined>(undefined);

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly ingredientCategoriesSorted = computed(() =>
    this.dbIngredientCategories().sort((a, b) => a.name.localeCompare(b.name)),
  );

  /* ================================
   * PUBLIC API
   * ================================ */
  selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean,
  ) {
    this.ingredientCategorySelected.set(
      atLeastOneUnitSelected ? undefined : ingredientTypeElement,
    );

    this.ingredientCategoryService.setSelectedIngredientCategory(
      this.ingredientCategorySelected(),
    );
  }
}
