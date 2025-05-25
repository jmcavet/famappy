import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/modal-confirm/modal-confirm.component';
import { MealCategoryWithIdAndDate } from '../../models/cuisine.model';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-manage-meal-categories-page',
  imports: [CapitalizePipe, ModalInputComponent, ModalConfirmComponent],
  templateUrl: './manage-meal-categories-page.component.html',
  styleUrl: './manage-meal-categories-page.component.css',
})
export class ManageMealCategoriesPageComponent {
  private recipeService = inject(RecipeService);

  mealCategories: MealCategoryWithIdAndDate[] = [];
  isLoading: boolean = false;
  showModalUpdateMealCategory: boolean = false;
  mealCategoryIdToUpdate: string = '';
  mealCategoryNameToUpdate: string = '';
  showModalDeleteMealCategory: boolean = false;
  mealCategoryIdToDelete: string = '';

  ngOnInit(): void {
    this.recipeService.mealCategories$.subscribe((mealCategories) => {
      this.mealCategories = mealCategories;
    });
  }

  openModalUpdateMealCategory(mealCategory: any) {
    this.showModalUpdateMealCategory = true;
    this.mealCategoryIdToUpdate = mealCategory.id;
    this.mealCategoryNameToUpdate = mealCategory.name;
  }

  onConfirmModalUpdateMealCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateMealCategory = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateMealCategory(this.mealCategoryIdToUpdate, event.name);
    }
  }

  async updateMealCategory(
    mealCategoryIdToUpdate: string,
    newMealCategoryName: string
  ) {
    this.isLoading = true;

    try {
      await this.recipeService.updateDocInFirestore(
        'meal-categories',
        mealCategoryIdToUpdate,
        newMealCategoryName
      );
      console.log(
        this.mealCategoryNameToUpdate +
          ' has been updated into ' +
          newMealCategoryName
      );

      // If the user has selected a specific meal category (e.g. main course) in the /meal-category page, which corresponds to
      // the original meal category name that has been updated, make sure to update it with the new meal category name
      const mealCategorySelected = this.recipeService.recipeState.mealCategory;
      if (mealCategorySelected === this.mealCategoryNameToUpdate) {
        this.recipeService.updateRecipeState(
          'mealCategory',
          newMealCategoryName
        );
      }
    } catch (error) {
      console.error('Error updating meal category: ', error);
    }
    this.isLoading = false;
  }

  openModalDeleteMealCategory(cuisine: any) {
    this.showModalDeleteMealCategory = true;
    this.mealCategoryIdToDelete = cuisine.id;
  }

  onConfirmModalDeleteMealCategory(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showModalDeleteMealCategory = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.deleteMealCategoryId(this.mealCategoryIdToDelete);
    }
  }

  getDeleteMessage() {
    const mealCategoryToDelete = this.mealCategories.find(
      (mealCategory) => mealCategory.id === this.mealCategoryIdToDelete
    );
    return `Do you really want to remove '${mealCategoryToDelete?.name}'?`;
  }

  async deleteMealCategoryId(mealCategoryIdToDelete: string) {
    this.isLoading = true;

    try {
      // If the user has selected a specific meal category (e.g. main course) in the /meal-category page, which corresponds to
      // the meal category that is about to be deleted, make sure to delete it and replace it by 'none'
      const mealCategorySelected = this.recipeService.recipeState.mealCategory;
      const mealCategoryNameDeleted = this.mealCategories.find(
        (mealCategory) => mealCategory.id === mealCategoryIdToDelete
      );
      if (mealCategorySelected === mealCategoryNameDeleted?.name) {
        this.recipeService.updateRecipeState('mealCategory', 'none');
      }

      await this.recipeService.deleteDocFromFirestore(
        'meal-categories',
        mealCategoryIdToDelete
      );
    } catch (error) {
      console.error('Error deleting cuisine: ', error);
    }
    this.isLoading = false;
  }
}
