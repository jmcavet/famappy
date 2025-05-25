import { Component, inject } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/modal-confirm/modal-confirm.component';
import { RecipeCategoryWithIdAndDate } from '../../models/cuisine.model';

@Component({
  selector: 'app-manage-recipe-categories-page',
  imports: [CapitalizePipe, ModalInputComponent, ModalConfirmComponent],
  templateUrl: './manage-recipe-categories-page.component.html',
  styleUrl: './manage-recipe-categories-page.component.css',
})
export class ManageRecipeCategoriesPageComponent {
  private recipeService = inject(RecipeService);

  recipeCategories: RecipeCategoryWithIdAndDate[] = [];
  isLoading: boolean = false;
  showModalUpdateRecipeCategory: boolean = false;
  recipeCategoryIdToUpdate: string = '';
  recipeCategoryNameToUpdate: string = '';
  showModalDeleteRecipeCategory: boolean = false;
  recipeCategoryIdToDelete: string = '';

  ngOnInit(): void {
    this.recipeService.recipeCategories$.subscribe((recipeCategories) => {
      this.recipeCategories = recipeCategories;
    });
  }

  openModalUpdateRecipeCategory(recipeCategory: any) {
    this.showModalUpdateRecipeCategory = true;
    this.recipeCategoryIdToUpdate = recipeCategory.id;
    this.recipeCategoryNameToUpdate = recipeCategory.name;
  }

  onConfirmModalUpdateRecipeCategory(event: {
    confirmed: boolean;
    name: string;
  }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateRecipeCategory = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateRecipeCategory(this.recipeCategoryIdToUpdate, event.name);
    }
  }

  async updateRecipeCategory(
    recipeCategoryIdToUpdate: string,
    newRecipeCategoryName: string
  ) {
    this.isLoading = true;

    try {
      await this.recipeService.updateDocInFirestore(
        'recipe-categories',
        recipeCategoryIdToUpdate,
        newRecipeCategoryName
      );
      console.log(
        this.recipeCategoryNameToUpdate +
          ' has been updated into ' +
          newRecipeCategoryName
      );

      // // If the user has selected a specific meal category (e.g. main course) in the /meal-category page, which corresponds to
      // // the original meal category name that has been updated, make sure to update it with the new meal category name
      // const recipeCategorySelected =
      //   this.recipeService.getRecipeCategorySelected();
      // if (recipeCategorySelected === this.recipeCategoryNameToUpdate) {
      //   this.recipeService.setRecipeCategory(newRecipeCategoryName);
      // }
    } catch (error) {
      console.error('Error updating recipe category: ', error);
    }
    this.isLoading = false;
  }

  openModalDeleteRecipeCategory(recipeCategory: any) {
    this.showModalDeleteRecipeCategory = true;
    this.recipeCategoryIdToDelete = recipeCategory.id;
  }

  onConfirmModalDeleteRecipeCategory(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showModalDeleteRecipeCategory = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.deleteRecipeCategoryId(this.recipeCategoryIdToDelete);
    }
  }

  getDeleteMessage() {
    const recipeCategoryToDelete = this.recipeCategories.find(
      (recipeCategory) => recipeCategory.id === this.recipeCategoryIdToDelete
    );
    return `Do you really want to remove '${recipeCategoryToDelete?.name}'?`;
  }

  async deleteRecipeCategoryId(recipeCategoryIdToDelete: string) {
    this.isLoading = true;

    try {
      // // If the user has selected a specific meal category (e.g. main course) in the /meal-category page, which corresponds to
      // // the meal category that is about to be deleted, make sure to delete it and replace it by 'none'
      // const recipeCategorySelected =
      //   this.recipeService.getRecipeCategorySelected();
      // const recipeCategoryNameDeleted = this.recipeCategories.find(
      //   (recipeCategory) => recipeCategory.id === recipeCategoryIdToDelete
      // );
      // if (recipeCategorySelected === recipeCategoryNameDeleted?.name) {
      //   this.recipeService.setRecipeCategory('none');
      // }

      await this.recipeService.deleteDocFromFirestore(
        'recipe-categories',
        recipeCategoryIdToDelete
      );
    } catch (error) {
      console.error('Error deleting recipe category: ', error);
    }
    this.isLoading = false;
  }
}
