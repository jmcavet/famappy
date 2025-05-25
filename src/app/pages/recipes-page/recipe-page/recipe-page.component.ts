import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesService } from '../../../services/recipes.service';
import { RecipeWithId } from '../recipe-card/recipe.model';

@Component({
  selector: 'app-recipe-page',
  imports: [],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.css',
})
export class RecipePageComponent {
  // 'recipeId' is the exact parameter passed in the url: /recipes/:recipeId
  recipeId = input.required<string>();

  recipes: RecipeWithId[] = [];
  recipe?: RecipeWithId;

  constructor(private router: Router, private recipesService: RecipesService) {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;

    const recipeState = navigationState?.['recipe'];

    if (recipeState) {
      this.recipe = recipeState;
    } else {
      this.recipesService.getRecipesFromStore((recipes) => {
        if (recipes) {
          this.recipes = recipes;
          const recipeSearched = this.recipes.find(
            (recipe) => recipe.id === this.recipeId()
          );
          this.recipe = recipeSearched;
        }
      });
    }
  }
}
