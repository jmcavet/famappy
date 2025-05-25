import { Component, inject } from '@angular/core';
import { RecipeCardComponent } from './recipe-card/recipe-card.component';
import { Recipe, RecipeWithId } from './recipe-card/recipe.model';
import { RecipesService } from '../../services/recipes.service';
import { ButtonComponent } from '../../shared/widgets/button/button.component';
import { Router, RouterLink } from '@angular/router';
import { MemberModalComponent } from '../members-page/member-modal/member-modal.component';
import { IngredientService } from '../../services/ingredient.service';
import { RecipeStateWithId } from '../../models/recipe.model';

@Component({
  selector: 'app-recipes-page',
  imports: [RecipeCardComponent, ButtonComponent, RouterLink],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.css',
})
export class RecipesPageComponent {
  private ingredientService = inject(IngredientService);

  recipes: RecipeStateWithId[] = [];
  isLoading: boolean = true;

  selectRecipe(recipeId: any) {
    console.log('Recipe clicked: ', recipeId);
  }

  constructor(private recipesService: RecipesService, private router: Router) {}

  ngOnInit() {
    // Subscribe to real-time updates with a callback
    this.recipesService.getRecipesFromStore((recipes) => {
      if (recipes) {
        this.recipes = recipes;
      }
      this.isLoading = false; // Data is fetched, hide loading
    });

    this.ingredientService.ingredients$.subscribe((ingredients) => {});
  }

  navigateToRecipe(recipe: RecipeWithId) {
    // Navigate with the recipe ID and pass the recipe object in the state
    this.router.navigate(['/recipes', recipe.id], {
      state: { recipe: recipe },
    });
  }
}
