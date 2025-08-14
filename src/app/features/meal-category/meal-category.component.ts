import { Component, inject, Signal, computed, signal } from '@angular/core';
import { Location } from '@angular/common';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { RecipeStateService } from '../../services/state/recipe.service';
import { MealCategoryBackendService } from '../../services/backend/meal-category.service';
import { MealCategoryDocInBackend } from '../../models/cuisine.model';

@Component({
  selector: 'app-meal-category',
  imports: [CapitalizePipe, ModalInputComponent],
  templateUrl: './meal-category.component.html',
  styleUrl: './meal-category.component.css',
})
export class MealCategoryComponent {
  private location = inject(Location);

  /** Services */
  private recipeService = inject(RecipeStateService);
  private mealCategoryService = inject(MealCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryService.mealCategories;

  /** Declaration of local signals */
  recipeState = this.recipeService.recipeState;
  showModalInput = signal<boolean>(false);
  mealCategoryName = signal<string>('');

  /** Declaration of recipe state signals */
  readonly mealCategoryId = computed(() => this.recipeState().mealCategoryId);

  selectMealCategory(mealCategoryId: string) {
    this.recipeService.updateProperty('mealCategoryId', mealCategoryId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }

  openModalInput() {
    this.showModalInput.set(true);
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput.set(false);

    if (event.confirmed) {
      this.addMealCategory(event.name);
    }
  }

  async addMealCategory(mealCategoryName: string) {
    this.mealCategoryService.saveMealCategoryIntoStore(mealCategoryName);
  }
}
