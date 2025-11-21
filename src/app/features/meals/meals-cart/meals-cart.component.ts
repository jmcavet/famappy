import { Component, computed, inject, signal } from '@angular/core';
import { MealStateService } from '../../../services/state/meal.service';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { RecipeCardComponent } from '../../recipes/components/recipe-card/recipe-card.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-meals-cart',
  imports: [RecipeCardComponent, NgClass],
  templateUrl: './meals-cart.component.html',
  styleUrl: './meals-cart.component.css',
})
export class MealsCartComponent {
  /** Services */
  private stateMealService = inject(MealStateService);

  /** Declaration of local signals */
  mealState = this.stateMealService.mealState;

  mealCategoriesSelected = this.mealState().mealCategoriesSelected;

  selectedRecipes = signal<RecipeWithId[]>([]);

  readonly cart = computed<RecipeWithId[]>(() => {
    console.log('this.mealState().cart: ', this.mealState().cart);
    return this.mealState().cart;
  });

  toggleRecipe(recipe: RecipeWithId) {
    const current = this.selectedRecipes();

    const isSelected = current.some((r) => r.id === recipe.id);

    if (isSelected) {
      // Remove recipe
      this.selectedRecipes.set(current.filter((r) => r.id !== recipe.id));
    } else {
      // Add recipe
      this.selectedRecipes.set([...current, recipe]);
    }
  }

  removeRecipes() {
    // Remove the recipes selected within the cart page from the cart
    this.stateMealService.removeRecipesFromCart(this.selectedRecipes());

    this.selectedRecipes.set([]);
  }
}
