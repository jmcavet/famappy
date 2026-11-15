import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../../../domain-facades/ingredientCategory.facade';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../../../models/ingredient.model';
import { ShoppingListIngredient } from '../../../../models/shopping-list.model';
import type { ModalShoppingFavoritesContext } from './modal-shopping-favorites.component';

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

  private readonly context =
    signal<ModalShoppingFavoritesContext | null>(null);

  connect(context: ModalShoppingFavoritesContext) {
    this.context.set(context);
  }

  /* ================================
   * UI state (owned by this facade)
   * ================================ */
  /** Internal signals */
  readonly categoryIdSelected = signal<string | null>(null);
  readonly selectedFavoriteIngredients = signal<string[]>([]);
  readonly selectedFavoriteMeasures = linkedSignal(() =>
    (this.context()?.shoppingListIngredients() ?? []).reduce<
      Record<string, number>
    >((measures, ingredient) => {
      measures[ingredient.id] = ingredient.measure;
      return measures;
    }, {}),
  );
  private readonly shoppingListIngredientIds = computed(
    () =>
      new Set(
        this.context()?.shoppingListIngredients().map(({ id }) => id) ?? [],
      ),
  );

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

  isIngredientAlreadyInShoppingList(ingredientId: string) {
    return this.shoppingListIngredientIds().has(ingredientId);
  }

  selectIngredient(ingredientId: string) {
    if (this.isIngredientAlreadyInShoppingList(ingredientId)) return;

    this.selectedFavoriteIngredients.update((currentSelected) => {
      if (currentSelected.includes(ingredientId)) {
        return currentSelected.filter((id) => id !== ingredientId);
      } else {
        return [...currentSelected, ingredientId];
      }
    });
  }

  measureFor(ingredient: IngredientDocInBackend) {
    return this.selectedFavoriteMeasures()[ingredient.id] ?? ingredient.measure;
  }

  changeIngredientMeasure(
    ingredient: IngredientDocInBackend,
    direction: 'decr' | 'incr',
  ) {
    if (this.isIngredientAlreadyInShoppingList(ingredient.id)) return;

    const currentMeasure = this.measureFor(ingredient);
    const step =
      ingredient.unit && ingredient.measure > 0 ? ingredient.measure : 1;
    const nextMeasure =
      direction === 'decr'
        ? Math.max(0, currentMeasure - step)
        : currentMeasure + step;

    this.selectedFavoriteMeasures.update((measures) => ({
      ...measures,
      [ingredient.id]: nextMeasure,
    }));
  }

  close() {
    this.modalService.cancel();
  }

  validate() {
    const selectedIngredients = this.dbIngredients()
      .filter((ingredient) =>
        this.selectedFavoriteIngredients().includes(ingredient.id),
      )
      .map(
        (ingredient): ShoppingListIngredient => ({
          id: ingredient.id,
          measure: this.measureFor(ingredient),
        }),
      );

    this.modalService.confirm(selectedIngredients);
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
