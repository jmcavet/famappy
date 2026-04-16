import { Component, computed, inject } from '@angular/core';
import { RecipeCardComponent } from '../../recipes/components/recipe-card/recipe-card.component';
import { MealCategoryDocInBackend } from '../../../models/cuisine.model';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IngredientCategoryDocInBackend } from '../../../models/ingredient.model';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { MealSelectionFacade } from './meals-selection.facade';
import { StepperComponent } from '../meals-cart/components/stepper/stepper.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { SelectionViewMode } from '../state/mealSelection.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-meals-selection',
  imports: [
    ReactiveFormsModule,
    RecipeCardComponent,
    RouterLink,
    CapitalizePipe,
    StepperComponent,
    SelectComponent,
    ButtonComponent,
    ChipComponent,
    SegmentedControlComponent,
  ],
  templateUrl: './meals-selection.component.html',
  styleUrl: './meals-selection.component.css',
})
export class MealsSelectionComponent {
  // Facade service and view model
  private facade = inject(MealSelectionFacade);

  // Direct facade signals exposed to HTML template
  plannedMealsCount = this.facade.plannedMealsCount;
  mealCategoryIdSelected = this.facade.mealCategoryIdSelected;
  viewMode = this.facade.viewMode;
  ingredientCategoriesSelected = this.facade.ingredientCategoriesSelected;
  mealCategoryNameSelected = this.facade.mealCategoryNameSelected;
  cartItems = this.facade.cartItems;
  btnValidateCartText = this.facade.btnValidateCartText;

  mealRatio = this.facade.mealRatio;
  mealCategories = this.facade.mealCategories;
  categoriesNames = this.facade.categoriesNames;
  ingredientCategoriesByMealCategory =
    this.facade.ingredientCategoriesByMealCategory;
  recipesFilteredByCategory = this.facade.recipesFilteredByCategory;
  dataIsLoading = this.facade.dataIsLoading;

  selectedRecipes = this.facade.selectedRecipes;
  showIngredientCategories = this.facade.showIngredientCategories;
  recipeMethods = this.facade.recipeMethods;
  methodControl = this.facade.methodControl;

  /*
  ----------------------------
  METHODS
  ----------------------------
  */
  getCuisineName(cuisineId: string): string {
    return this.facade.getCuisineName(cuisineId);
  }

  setMealCategory(mealCategorySelected: MealCategoryDocInBackend) {
    this.facade.setMealCategory(mealCategorySelected);
  }

  setIngredientCategory(ingredientCategory: IngredientCategoryDocInBackend) {
    this.facade.setIngredientCategory(ingredientCategory);
  }

  decreaseRatio() {
    this.facade.decreaseRatio();
  }

  increaseRatio() {
    this.facade.increaseRatio();
  }

  toggleRecipe(recipe: RecipeWithId) {
    this.facade.toggleRecipe(recipe);
  }

  toggleView(viewMode: SelectionViewMode) {
    this.facade.toggleView(viewMode);
  }

  toggleShowIngredientCategories() {
    this.facade.toggleShowIngredientCategories();
  }

  addRecipesToCart() {
    this.facade.addRecipesToCart();

    // Reset the list of recipe items selected by the user once they have been added to the cart
    this.facade.resetSelectedRecipes();
  }

  toggleMealCategory(mealCategoryName: string) {
    this.facade.toggleMealCategory(mealCategoryName);
  }
}
