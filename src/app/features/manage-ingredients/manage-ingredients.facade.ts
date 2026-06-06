import { computed, inject, Injectable, signal } from '@angular/core';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientDomainFacade } from '../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';
import {
  IngredientWithIdAndDate,
  IsAcending,
  SortKey,
} from '../../models/ingredient.model';
import { ModalService } from '../../shared/layout/overlays/modal/modal.service';
import { ModalConfirmComponent } from '../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';

@Injectable()
export class ManageIngredientsFacade {
  /* ================================
   * Dependencies
   * ================================ */
  private modalService = inject(ModalService);

  /** Framework dependencies */

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
  readonly ingredientsUpdating =
    this.ingredientDomainFacade.ingredientsUpdating;
  readonly ingredientsDeleting =
    this.ingredientDomainFacade.ingredientsDeleting;

  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  readonly ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  editIngredientIndex = signal<number | null>(null); // Track edit mode for ingredients
  filterSelected = signal<SortKey>('name');
  isAscending = signal<IsAcending>({
    name: true,
    category: false,
    dateCreated: false,
  });

  /** Private signals */
  private categoryNameTyped = signal<string | undefined>('');

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly pageIsLoading = computed(() => {
    return (
      this.ingredientsLoading() ||
      this.ingredientsUpdating() ||
      this.ingredientsDeleting()
    );
  });

  /** Compute the ingredient names available, in order to avoid creating duplicates */
  existingIngredientNames = computed(() =>
    this.dbIngredients().map((i) => i.name),
  );

  /** Compute the ingredients filtered, whenever the following signals change:
   * ingredients, ingredientCategories, ingredientCategorySelected, filterSelected, isAscending */
  ingredientsFiltered = computed(() => {
    const ingredients = this.dbIngredients();
    const categories = this.dbIngredientCategories();
    const categorySelected =
      this.ingredientCategoryDomainFacade.ingredientCategorySelected();
    const filter = this.filterSelected();
    const ascending = this.isAscending();

    if (!ingredients.length || !categories.length) return [];

    const ingredientsWithCategoryName = ingredients.map((ingredient) => {
      const categoryName =
        categories.find((t) => t.id === ingredient.categoryId)?.name ?? '';
      return { ...ingredient, categoryName };
    });

    let filtered = categorySelected
      ? ingredientsWithCategoryName.filter(
          (ingredient) => ingredient.categoryId === categorySelected.id,
        )
      : ingredientsWithCategoryName;

    return filtered.sort((a, b) => {
      if (filter === 'name') {
        return ascending.name
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (filter === 'category') {
        const nameA = this.stripEmoji(a.categoryName).toLowerCase() ?? '';
        const nameB = this.stripEmoji(b.categoryName).toLowerCase() ?? '';
        return ascending.category
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const dateA = this.toDate(a.dateCreated);
        const dateB = this.toDate(b.dateCreated);
        return ascending.dateCreated
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      }
    });
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  changeCategory(event: Event): void {
    this.categoryNameTyped.set((event.target as HTMLSelectElement).value);
  }

  onFilterSelected(filter: SortKey) {
    this.isAscending.update((current) => {
      return {
        ...current,
        [filter === 'category' ? 'category' : filter]:
          !current[filter === 'category' ? 'category' : filter],
      };
    });
  }

  deleteModal(event: MouseEvent, ingredientId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(ingredientId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteIngredient(ingredientId),
      },
    );
  }

  async updateIngredient(ingredient: IngredientWithIdAndDate) {
    /** Find the id of the ingredient category of the selected ingredient */
    const updatedIngredientCategorySearched =
      this.dbIngredientCategories().find(
        (category) => category.id === ingredient.categoryId,
      );

    const updatedIngredientCategoryId = updatedIngredientCategorySearched
      ? updatedIngredientCategorySearched.id
      : '';

    const propertiesToUpdate = {
      categoryId: updatedIngredientCategoryId,
      name: ingredient.name,
    };

    this.ingredientDomainFacade.updateIngredient(
      ingredient.id,
      propertiesToUpdate,
      this.recipeService.mustPreserveState,
    );
  }

  /* ================================
   * PRIVATE HELPERS
   * ================================ */
  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value?.toDate instanceof Function) return value.toDate(); // Firestore Timestamp
    return new Date(value); // Try parsing string or fallback
  }

  private stripEmoji(text: string): string {
    // Removes most common emoji characters
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u200D|\uFE0F)/g,
        '',
      )
      .trim();
  }

  private modalDeleteMessage(ingredientId: string) {
    const ingredientToDelete = this.dbIngredients().find(
      (ingredient) => ingredient.id === ingredientId,
    );

    return `Do you really want to remove '${ingredientToDelete?.name}' ?`;
  }

  private async deleteIngredient(ingredientId: string) {
    this.ingredientDomainFacade.deleteIngredient(ingredientId);
  }
}
