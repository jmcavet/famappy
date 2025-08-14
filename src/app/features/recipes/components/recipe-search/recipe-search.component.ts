import { Component, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeWithId } from '../recipe-card/recipe.model';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../../models/cuisine.model';
import { RecipeStateService } from '../../../../services/state/recipe.service';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../../../models/ingredient.model';

@Component({
  selector: 'app-recipe-search',
  imports: [FormsModule],
  templateUrl: './recipe-search.component.html',
  styleUrl: './recipe-search.component.css',
})
export class RecipeSearchComponent {
  private router = inject(Router);

  private recipeStateService = inject(RecipeStateService);

  /** Declaration of local signals */
  recipeState = this.recipeStateService.recipeState;
  dateIsIncreasing = this.recipeStateService.dateIsIncreasing;

  filter = model.required();
  recipesFilteredByTitle = input<RecipeWithId[]>();
  recipesFiltered = input<RecipeWithId[]>();
  dbMealCategories = input<MealCategoryDocInBackend[]>();
  dbCuisines = input<CuisineDocInBackend[]>();
  dbRecipeCategories = input<RecipeCategoryDocInBackend[]>();
  dbIngredients = input<IngredientDocInBackend[]>();
  dbIngredientCategories = input<IngredientCategoryDocInBackend[]>();

  onResetFilterText() {
    this.filter.set('');
  }

  navigateToRecipeFilter() {
    // Navigate with the recipe ID and pass the recipes object in the state

    this.router.navigate(['/recipes/filter'], {
      state: {
        filteredRecipes: this.recipesFilteredByTitle(),
        mealCategories: this.dbMealCategories(),
        cuisines: this.dbCuisines(),
        recipeCategories: this.dbRecipeCategories(),
        ingredients: this.dbIngredients(),
        ingredientCategories: this.dbIngredientCategories(),
      },
    });
  }

  toggleSorting() {
    this.dateIsIncreasing.update((curr) => !curr);
  }
}
