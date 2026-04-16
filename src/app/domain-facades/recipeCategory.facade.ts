import { inject, Injectable, Signal } from '@angular/core';
import { RecipeCategoryBackendService } from '../services/backend/recipe-category.service';
import { RecipeCategoryDocInBackend } from '../models/cuisine.model';

@Injectable({ providedIn: 'root' })
export class RecipeCategoryDomainFacade {
  private recipeCategoryBackendService = inject(RecipeCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipeCategories: Signal<RecipeCategoryDocInBackend[]> =
    this.recipeCategoryBackendService.recipeCategories;

  readonly recipeCategoriesLoading = this.recipeCategoryBackendService.loading;
}
