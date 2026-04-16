import { inject, Injectable, Signal } from '@angular/core';
import { IngredientCategoryDocInBackend } from '../models/ingredient.model';
import { IngredientCategoryBackendService } from '../services/backend/ingredient-category.service';

@Injectable({ providedIn: 'root' })
export class IngredientCategoryDomainFacade {
  private ingredientCategoryBackendService = inject(
    IngredientCategoryBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories: Signal<IngredientCategoryDocInBackend[]> =
    this.ingredientCategoryBackendService.ingredientCategories;

  readonly ingredientCategoriesLoading =
    this.ingredientCategoryBackendService.loading;
}
