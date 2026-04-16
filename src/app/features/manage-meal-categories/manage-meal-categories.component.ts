import { Component, computed, inject, signal, Signal } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RecipeStateService } from '../../services/state/recipe.service';
import { MealCategoryBackendService } from '../../services/backend/meal-category.service';
import { MealCategoryDocInBackend } from '../../models/cuisine.model';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-manage-meal-categories',
  imports: [CapitalizePipe, ModalInputComponent, LoadingComponent],
  templateUrl: './manage-meal-categories.component.html',
  styleUrl: './manage-meal-categories.component.css',
})
export class ManageMealCategoriesComponent {
  private modalService = inject(ModalService);

  /** Services */
  private recipeStateService = inject(RecipeStateService);
  private mealCategoryService = inject(MealCategoryBackendService);
  private recipeBackendService = inject(RecipeBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryService.mealCategories;
  readonly mealCategoriesAreLoading = this.mealCategoryService.loading;
  readonly mealCategoriesAreSaving = this.mealCategoryService.saving;
  readonly mealCategoryisUpdating = this.mealCategoryService.updating;
  readonly mealCategoryIsBeingDeleted = this.mealCategoryService.deleting;
  readonly recipeIsUpdating = this.recipeBackendService.updating;

  /** Declaration of local signals */
  recipeState = this.recipeStateService.recipeState;
  showModalAddMealCategory = signal<boolean>(false);
  showModalUpdateMealCategory = signal<boolean>(false);
  mealCategoryIdToUpdate = signal<string>('');
  mealCategoryNameToUpdate = signal<string>('');
  mealCategoryIdToDelete = signal<string>('');
  mealCategoryName = signal<string>('');

  /** Declaration of recipe state signals */
  readonly mealCategoryId = computed(() => this.recipeState().mealCategoryId);

  readonly canShowPage = computed(() => {
    return (
      this.mealCategoriesAreLoading() ||
      this.mealCategoriesAreSaving() ||
      this.mealCategoryisUpdating() ||
      this.mealCategoryIsBeingDeleted() ||
      this.recipeIsUpdating()
    );
  });

  openModalAddMealCategory() {
    this.showModalAddMealCategory.set(true);
  }

  onConfirmModalAddMealCategory(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalAddMealCategory.set(false);

    if (event.confirmed) {
      this.addMealCategory(event.name);
    }
  }

  openModalUpdateMealCategory(mealCategory: any) {
    this.showModalUpdateMealCategory.set(true);
    this.mealCategoryIdToUpdate.set(mealCategory.id);
    this.mealCategoryNameToUpdate.set(mealCategory.name);
  }

  onConfirmModalUpdateMealCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateMealCategory.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateMealCategory(this.mealCategoryIdToUpdate(), event.name);
    }
  }

  async addMealCategory(mealCategoryName: string) {
    this.mealCategoryService.saveMealCategoryIntoStore(mealCategoryName);
  }

  async updateMealCategory(
    mealCategoryIdToUpdate: string,
    newMealCategoryName: string,
  ) {
    this.mealCategoryService.updateMealCategoryInStore(
      mealCategoryIdToUpdate,
      newMealCategoryName,
      this.recipeStateService.mustPreserveState,
    );
  }

  openDeleteModal(event: MouseEvent, mealCategoryId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(mealCategoryId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteMealCategoryId(mealCategoryId),
      },
    );
  }

  modalDeleteMessage(mealCategoryId: string) {
    const mealCategoryToDelete = this.dbMealCategories().find(
      (mealCategory) => mealCategory.id === mealCategoryId,
    );
    return `Do you really want to remove '${mealCategoryToDelete?.name}'?`;
  }

  async deleteMealCategoryId(mealCategoryIdToDelete: string) {
    const recipesWithMealCategoryId = this.dbRecipes().filter(
      (recipe) => recipe.mealCategoryId === mealCategoryIdToDelete,
    );

    // Reset the 'mealCategoryId' property (to '') of the recipes which mealCategoryId
    // corresponds to the one just deleted)
    await this.recipeBackendService.resetRecipesPropertiesInStore(
      recipesWithMealCategoryId,
      { mealCategoryId: '' },
      this.recipeStateService.mustPreserveState,
    );
  }
}
