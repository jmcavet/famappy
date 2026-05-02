import { computed, inject, Injectable, signal } from '@angular/core';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientDomainFacade } from '../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import {
  IngredientWithIdAndDate,
  IngredientWithTypeName,
  IsAcending,
  SortKey,
} from '../../models/ingredient.model';

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

  showMessageNoCategories = computed(
    () =>
      this.dbIngredientCategories().length === 0 &&
      !this.ingredientCategoriesLoading(),
  );

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
    console.log('filter: ', filter);
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

  editIngredient(index: number, ingredient: IngredientWithTypeName): void {
    /** Focus on the ingredient input field when the edit button is clicked.
     * Edit button clicked: first, save the ingredient type name. If only the name is changed,
     * the right type name will be saved in memory and later provided as property for the updated ingredient.
     */
    this.categoryNameTyped.set(ingredient.categoryName);

    this.editIngredientIndex.set(index);
  }

  validateUpdate(ingredient: IngredientWithIdAndDate) {
    this.updateIngredientName(ingredient);
    this.resetEditFunctionality();
  }

  editPressEnterIngredient(
    event: KeyboardEvent,
    ingredient: IngredientWithIdAndDate,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.updateIngredientName(ingredient);
      this.resetEditFunctionality();
    }
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

  private resetEditFunctionality() {
    // Reset the editIngredientIndex to null so that the edit-related template is no more visible
    this.editIngredientIndex.set(null);
  }

  private async updateIngredientName(ingredient: IngredientWithIdAndDate) {
    /** Find the id of the ingredient category that has been selected from the
     * drop down menu in the edit mode.
     */
    const updatedIngredientCategorySearched =
      this.dbIngredientCategories().find(
        (category) => category.name === this.categoryNameTyped(),
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
