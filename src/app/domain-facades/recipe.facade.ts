import { inject, Injectable, Signal } from '@angular/core';
import { RecipeBackendService } from '../services/backend/recipe.service';
import { RecipeWithId } from '../features/recipes/components/recipe-card/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeDomainFacade {
  // Meal-related state services
  private recipeBackendService = inject(RecipeBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;

  readonly recipesLoading = this.recipeBackendService.loading;

  public getRecipeById(id: string): RecipeWithId | undefined {
    return this.dbRecipes().find((r) => (r.id = id));
  }
}
