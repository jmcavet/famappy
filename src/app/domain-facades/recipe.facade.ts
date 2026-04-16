import { inject, Injectable, Signal, WritableSignal } from '@angular/core';
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
  readonly recipesUpdating = this.recipeBackendService.updating;

  public getRecipeById(id: string): RecipeWithId | undefined {
    return this.dbRecipes().find((r) => (r.id = id));
  }

  public async resetRecipesProperties(
    recipesToUpdate: RecipeWithId[],
    propertiesToUpdate: Partial<RecipeWithId>,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    await this.recipeBackendService.resetRecipesPropertiesInStore(
      recipesToUpdate,
      propertiesToUpdate,
      mustPreserveState,
    );
  }
}
