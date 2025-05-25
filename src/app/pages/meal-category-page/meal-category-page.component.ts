import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { RecipeService } from '../../services/recipe.service';
import { MealCategoryWithIdAndDate } from '../../models/cuisine.model';
import { Location } from '@angular/common';
import { ModalInputComponent } from '../../shared/modal-input/modal-input.component';

@Component({
  selector: 'app-meal-category-page',
  imports: [CapitalizePipe, ModalInputComponent],
  templateUrl: './meal-category-page.component.html',
  styleUrl: './meal-category-page.component.css',
})
export class MealCategoryPageComponent {
  private recipeService = inject(RecipeService);
  private location = inject(Location);
  mealCategoryPreviouslySelected: string = 'none';
  isLoading: boolean = false;
  showModalInput: boolean = false;
  mealCategoryName: string = '';

  mealCategories: MealCategoryWithIdAndDate[] = [];

  ngOnInit(): void {
    this.recipeService.recipeState$.subscribe((state) => {
      this.mealCategoryPreviouslySelected = state.mealCategory;
    });

    this.recipeService.mealCategories$.subscribe((mealCategories) => {
      this.mealCategories = mealCategories;
    });
  }

  selectMealCategory(mealCategory: string) {
    this.recipeService.updateRecipeState('mealCategory', mealCategory);
    this.recipeService.mustPreserveState = true;
    this.location.back();
  }

  openModalInput() {
    this.showModalInput = true;
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.addMealCategory(event.name);
    }
  }

  async addMealCategory(mealCategoryName: string) {
    console.log('Meal Category entered by user: ', mealCategoryName);
    this.isLoading = true;

    const newMealCategory = {
      name: mealCategoryName,
    };

    try {
      const docId = await this.recipeService.saveDocIntoFirestore(
        'meal-categories',
        newMealCategory
      );
      console.log('New meal category document ID: ', docId);
    } catch (error) {
      console.error('Error saving meal category: ', error);
    }
    this.isLoading = false;
  }
}
