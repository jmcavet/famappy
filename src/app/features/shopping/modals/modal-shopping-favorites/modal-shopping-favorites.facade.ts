import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../../../domain-facades/ingredientCategory.facade';
import { IngredientCategoryDocInBackend } from '../../../../models/ingredient.model';

@Injectable()
export class ModalShoppingFavoritesFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Framework dependencies */
  private readonly modalService = inject(ModalService);

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /** Transitional state */
  // private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbIngredients = this.ingredientDomainFacade.dbIngredients;
  readonly ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;

  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  readonly ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  /* ================================
   * UI state (owned by this facade)
   * ================================ */
  /** Internal signals */
  readonly categoryIdSelected = signal<string | null>(null);

  /* ================================
   * Computed signals
   * ================================ */

  readonly ingredientCategories = computed(() => {
    const categoryIds = new Set(this.categoryIdsWithFavoriteIngredients());

    return this.dbIngredientCategories()
      .filter((category) => categoryIds.has(category.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly ingredientsPerCategorySelected = computed(() => {
    const ingredients = this.dbIngredients();
    const toto = ingredients.filter(
      (ing) => ing.categoryId === this.categoryIdSelected() && ing.isFavorite,
    );

    return toto;
  });

  readonly categoryIdsWithFavoriteIngredients = computed(() => {
    return [
      ...new Set(
        this.dbIngredients()
          .filter((ingredient) => ingredient.isFavorite)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((ingredient) => ingredient.categoryId),
      ),
    ];
  });

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */

  public toggleSelection(category: IngredientCategoryDocInBackend) {
    this.categoryIdSelected.set(category.id);
  }

  close() {
    this.modalService.cancel();
  }

  validate() {
    this.modalService.confirm();
  }

  constructor() {
    effect(() => {
      console.log(
        'categoryIdsWithFavoriteIngredients: ',
        this.categoryIdsWithFavoriteIngredients(),
      );
      if (this.categoryIdsWithFavoriteIngredients().length > 0) {
        this.categoryIdSelected.set(
          this.categoryIdsWithFavoriteIngredients()[0],
        );
      }
    });
  }
}
