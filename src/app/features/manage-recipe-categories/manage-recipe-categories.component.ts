import { Component, computed, inject, signal, Signal } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RecipeCategoryBackendService } from '../../services/backend/recipe-category.service';
import { FirestoreService } from '../../services/backend/generic.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { RecipeCategoryDocInBackend } from '../../models/cuisine.model';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { RecipeBackendService } from '../../services/backend/recipe.service';

@Component({
  selector: 'app-manage-recipe-categories',
  imports: [
    CapitalizePipe,
    ModalInputComponent,
    ModalConfirmComponent,
    LoadingComponent,
  ],
  templateUrl: './manage-recipe-categories.component.html',
  styleUrl: './manage-recipe-categories.component.css',
})
export class ManageRecipeCategoriesComponent {
  /** Services */
  private recipeCategoryService = inject(RecipeCategoryBackendService);
  private recipeStateService = inject(RecipeStateService);
  private recipeBackendService = inject(RecipeBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly dbRecipeCategories: Signal<RecipeCategoryDocInBackend[]> =
    this.recipeCategoryService.recipeCategories;
  readonly recipesCategoriesAreLoading = this.recipeCategoryService.loading;
  readonly recipesCategoriesAreSaving = this.recipeCategoryService.saving;
  readonly recipeCategoryisUpdating = this.recipeCategoryService.updating;
  readonly recipeCategoryIsBeingDeleted = this.recipeCategoryService.deleting;

  /** Declaration of local signals */
  recipeCategoryName = signal<string>('');
  recipeCategoryIdToUpdate = signal<string>('');
  recipeCategoryNameToUpdate = signal<string>('');
  recipeCategoryIdToDelete = signal<string>('');
  showModalAddRecipeCategory = signal<boolean>(false);
  showModalUpdateRecipeCategory = signal<boolean>(false);
  showModalDeleteRecipeCategory = signal<boolean>(false);

  readonly canShowPage = computed(() => {
    return (
      this.recipesCategoriesAreLoading() ||
      this.recipesCategoriesAreSaving() ||
      this.recipeCategoryIsBeingDeleted() ||
      this.recipeCategoryisUpdating()
    );
  });

  openModalAddRecipeCategory() {
    this.showModalAddRecipeCategory.set(true);
  }

  onConfirmModalAddRecipeCategory(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalAddRecipeCategory.set(false);

    if (event.confirmed) {
      this.addRecipeCategory(event.name);
    }
  }

  async addRecipeCategory(recipeCategoryName: string) {
    this.recipeCategoryService.saveRecipeCategoryIntoStore(recipeCategoryName);
  }

  openModalUpdateRecipeCategory(recipeCategory: any) {
    this.showModalUpdateRecipeCategory.set(true);
    this.recipeCategoryIdToUpdate.set(recipeCategory.id);
    this.recipeCategoryNameToUpdate.set(recipeCategory.name);
  }

  onConfirmModalUpdateRecipeCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateRecipeCategory.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateRecipeCategory(this.recipeCategoryIdToUpdate(), event.name);
    }
  }

  async updateRecipeCategory(
    recipeCategoryIdToUpdate: string,
    newRecipeCategoryName: string
  ) {
    this.recipeCategoryService.updateRecipeCategoryInStore(
      recipeCategoryIdToUpdate,
      newRecipeCategoryName,
      this.recipeStateService.mustPreserveState
    );
  }

  openModalDeleteRecipeCategory(recipeCategory: any) {
    this.showModalDeleteRecipeCategory.set(true);
    this.recipeCategoryIdToDelete.set(recipeCategory.id);
  }

  onConfirmModalDeleteRecipeCategory(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showModalDeleteRecipeCategory.set(false);

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.deleteRecipeCategoryId(this.recipeCategoryIdToDelete());
    }
  }

  getDeleteMessage() {
    const recipeCategoryToDelete = this.dbRecipeCategories().find(
      (recipeCategory) => recipeCategory.id === this.recipeCategoryIdToDelete()
    );
    return `Do you really want to remove '${recipeCategoryToDelete?.name}'?`;
  }

  async deleteRecipeCategoryId(recipeCategoryIdToDelete: string) {
    // Delete the document from the 'recipe-categories' collection in the store
    this.recipeCategoryService.deleteRecipeCategoryInStore(
      recipeCategoryIdToDelete
    );

    const recipesWithRecipeCategoryId = this.dbRecipes().filter((recipe) =>
      recipe.recipeCategoryIds.includes(recipeCategoryIdToDelete)
    );

    // Remove the recipe category Id from the list of ids in the property array 'recipeCategoryIds'
    // from the relevant recipe objects
    await this.recipeBackendService.updateRecipesAfterDeletingRecipeCategoryId(
      recipesWithRecipeCategoryId,
      recipeCategoryIdToDelete,
      this.recipeStateService.mustPreserveState
    );
  }
}
