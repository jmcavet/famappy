import { Component, computed, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { FirestoreService } from '../../services/backend/generic.service';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';
import { IngredientDocInBackend } from '../../models/ingredient.model';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [FormsModule, LoadingComponent, ModalInputComponent],
  templateUrl: './manage-ingredient-categories.component.html',
  styleUrl: './manage-ingredient-categories.component.css',
})
export class ManageIngredientCategoriesComponent {
  /** Services */
  private modalService = inject(ModalService);
  private ingredientCategoryService = inject(IngredientCategoryBackendService);
  private firestoreService = inject(FirestoreService);
  private ingredientService = inject(IngredientBackendService);
  private recipeService = inject(RecipeStateService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;

  readonly ingredientCategoriesAreLoading =
    this.ingredientCategoryService.loading;
  readonly ingredientCategoriesAreSaving =
    this.ingredientCategoryService.saving;
  readonly ingredientCategoryisUpdating =
    this.ingredientCategoryService.updating;
  readonly ingredientCategoryIsBeingDeleted =
    this.ingredientCategoryService.deleting;

  /** Declaration of local signals */
  ingredientCategoryName = signal<string>('');
  ingredientCategoryIdToUpdate = signal<string>('');
  ingredientCategoryNameToUpdate = signal<string>('');
  showModalAddIngredientCategory = signal<boolean>(false);
  showModalUpdateIngredientCategory = signal<boolean>(false);

  oldIngredientCategoryToBeUpdated: string = '';
  ingredientCategoryIdToRemove: string = '';
  ingredientsToRemove: IngredientDocInBackend[] = [];

  nameAlreadyExists: boolean = false;

  tempNames: { [id: string]: string } = {};

  readonly canShowPage = computed(() => {
    return (
      this.ingredientCategoriesAreLoading() ||
      this.ingredientCategoriesAreSaving() ||
      this.ingredientCategoryisUpdating() ||
      this.ingredientCategoryIsBeingDeleted()
    );
  });

  openModalAddIngredientCategory() {
    this.showModalAddIngredientCategory.set(true);
  }

  onConfirmModalAddIngredientCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalAddIngredientCategory.set(false);

    if (event.confirmed) {
      this.addIngredientCategory(event.name);
    }
  }

  async addIngredientCategory(ingredientCategoryName: string) {
    this.ingredientCategoryService.saveRecipeCategoryIntoStore(
      ingredientCategoryName,
    );
  }

  openModalUpdateIngredientCategory(ingredientCategory: any) {
    this.showModalUpdateIngredientCategory.set(true);
    this.ingredientCategoryIdToUpdate.set(ingredientCategory.id);
    this.ingredientCategoryNameToUpdate.set(ingredientCategory.name);
  }

  onConfirmModalUpdateIngredientCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateIngredientCategory.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateIngredientCategory(
        this.ingredientCategoryIdToUpdate(),
        event.name,
      );
    }
  }

  async updateIngredientCategory(
    ingredientCategoryIdToUpdate: string,
    newIngredientCategoryName: string,
  ) {
    this.ingredientCategoryService.updateIngredientCategoryInStore(
      ingredientCategoryIdToUpdate,
      newIngredientCategoryName,
      this.recipeService.mustPreserveState,
    );
  }

  openDeleteModal(event: MouseEvent, ingredientCategoryId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(ingredientCategoryId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.onRemoveIngredientCategory(ingredientCategoryId),
      },
    );
  }

  public modalDeleteMessage(ingredientCategoryId: string) {
    const ingredients = this.ingredientService.ingredients();
    this.ingredientsToRemove = ingredients.filter(
      (ingredient) => ingredient.categoryId === ingredientCategoryId,
    );

    const count = this.ingredientsToRemove.length;

    return count > 0
      ? `Do you really want to remove this category? ${count} ingredients from this category will be uncategorized.`
      : 'Do you really want to remove this category?';
  }

  async onRemoveIngredientCategory(ingredientCategoryIdToDelete: string) {
    this.ingredientCategoryService.deleteIngredientCategoryInStore(
      ingredientCategoryIdToDelete,
    );

    try {
      this.firestoreService.removeDocumentByPropertyId(
        'ingredients',
        'typeId',
        ingredientCategoryIdToDelete,
      );
    } catch (error) {
      console.log('Error removing ingredient: ', error);
    }
  }
}
