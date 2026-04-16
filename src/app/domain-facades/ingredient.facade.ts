import { computed, inject, Injectable, Signal } from '@angular/core';
import { IngredientBackendService } from '../services/backend/ingredient.service';
import { IngredientDocInBackend } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class IngredientDomainFacade {
  private ingredientBackendService = inject(IngredientBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientBackendService.ingredients;

  readonly ingredientsLoading = this.ingredientBackendService.loading;

  readonly dbIngredientsNames = computed(() =>
    this.dbIngredients().map((ing) => ing.name)
  );
}
