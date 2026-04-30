import {
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import {
  IngredientDocInBackend,
  IngredientWithIdAndDate,
  IngredientWithTypeName,
  IsAcending,
  SortKey,
} from '../../models/ingredient.model';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientAdderComponent } from './components/ingredient-adder/ingredient-adder.component';
import { IngredientCategoriesSelectionComponent } from './components/ingredient-categories-selection/ingredient-categories-selection.component';
import { IngredientFilterComponent } from './components/ingredient-filter/ingredient-filter.component';
import { ModalService } from '../../shared/modal/modal.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-manage-ingredients',
  imports: [
    FormsModule,
    LoadingComponent,
    IngredientAdderComponent,
    IngredientCategoriesSelectionComponent,
    IngredientFilterComponent,
    ButtonComponent,
  ],
  templateUrl: './manage-ingredients.component.html',
  styleUrl: './manage-ingredients.component.css',
})
export class ManageIngredientsComponent {
  /** Services */
  private modalService = inject(ModalService);
  private ingredientService = inject(IngredientBackendService);
  private ingredientCategoryService = inject(IngredientCategoryBackendService);
  private recipeService = inject(RecipeStateService);

  /** Declaration of signals communicating with firestore */
  readonly ingredients: Signal<IngredientDocInBackend[]> =
    this.ingredientService.ingredients;
  readonly ingredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;
  readonly ingredientCategoriesAreLoading =
    this.ingredientCategoryService.loading;

  readonly ingredientsAreLoading = this.ingredientService.loading;
  readonly ingredientIsUpdating = this.ingredientService.updating;
  readonly ingredientIsBeingDeleted = this.ingredientService.deleting;

  /** Declaration of local signals */
  categoryNameTyped = signal<string | undefined>('');
  editIngredientIndex = signal<number | null>(null); // Track edit mode for ingredients
  showConfirmDeleteModal = signal<boolean>(false);
  ingredientIdToRemove = signal<string>('');

  filterSelected = signal<SortKey>('dateCreated');
  isAscending = signal<IsAcending>({
    name: false,
    category: false,
    dateCreated: false,
  });

  readonly pageIsLoading = computed(() => {
    return (
      this.ingredientsAreLoading() ||
      this.ingredientIsUpdating() ||
      this.ingredientIsBeingDeleted()
    );
  });

  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;

  /** Compute the ingredient names available, in order to avoid creating duplicates */
  existingIngredientNames = computed(() =>
    this.ingredients().map((i) => i.name),
  );

  /** Compute the ingredients filtered, whenever the following signals change:
   * ingredients, ingredientCategories, ingredientCategorySelected, filterSelected, isAscending */
  ingredientsFiltered = computed(() => {
    const ingredients = this.ingredients();
    const categories = this.ingredientCategories();
    const categorySelected =
      this.ingredientCategoryService.ingredientCategorySelected();
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

  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value?.toDate instanceof Function) return value.toDate(); // Firestore Timestamp
    return new Date(value); // Try parsing string or fallback
  }

  stripEmoji(text: string): string {
    // Removes most common emoji characters
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u200D|\uFE0F)/g,
        '',
      )
      .trim();
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

  showMessageNoCategories = computed(
    () =>
      this.ingredientCategories().length === 0 &&
      !this.ingredientCategoriesAreLoading(),
  );

  onCategoryChange(event: Event): void {
    this.categoryNameTyped.set((event.target as HTMLSelectElement).value);
  }

  editIngredient(index: number, ingredient: IngredientWithTypeName): void {
    /** Focus on the ingredient input field when the edit button is clicked.
     * Edit button clicked: first, save the ingredient type name. If only the name is changed,
     * the right type name will be saved in memory and later provided as property for the updated ingredient.
     */
    this.categoryNameTyped.set(ingredient.categoryName);

    this.editIngredientIndex.set(index);

    setTimeout(() => {
      // Focus after Angular has rendered the input
      this.editInputRef.nativeElement.focus();
    });
  }

  onEditPressEnterIngredient(
    event: KeyboardEvent,
    ingredient: IngredientWithIdAndDate,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.updateIngredientName(ingredient);
      this.resetEditFunctionality();
    }
  }

  onValidateUpdate(ingredient: IngredientWithIdAndDate) {
    this.updateIngredientName(ingredient);
    this.resetEditFunctionality();
  }

  async updateIngredientName(ingredient: IngredientWithIdAndDate) {
    /** Find the id of the ingredient category that has been selected from the
     * drop down menu in the edit mode.
     */
    const updatedIngredientCategorySearched = this.ingredientCategories().find(
      (category) => category.name === this.categoryNameTyped(),
    );

    const updatedIngredientCategoryId = updatedIngredientCategorySearched
      ? updatedIngredientCategorySearched.id
      : '';

    const propertiesToUpdate = {
      categoryId: updatedIngredientCategoryId,
      name: ingredient.name,
    };

    this.ingredientService.updateIngredientInStore(
      ingredient.id,
      propertiesToUpdate,
      this.recipeService.mustPreserveState,
    );
  }

  resetEditFunctionality() {
    // Reset the editIngredientIndex to null so that the edit-related template is no more visible
    this.editIngredientIndex.set(null);
  }

  openDeleteModal(event: MouseEvent, ingredientId: string) {
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

  public modalDeleteMessage(ingredientId: string) {
    const ingredientToDelete = this.ingredients().find(
      (ingredient) => ingredient.id === ingredientId,
    );

    return `Do you really want to remove '${ingredientToDelete?.name}' ?`;
  }

  async deleteIngredient(ingredientId: string) {
    this.ingredientService.deleteIngredientfromStore(ingredientId);
  }
}
