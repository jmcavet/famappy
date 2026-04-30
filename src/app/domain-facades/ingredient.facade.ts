import {
  computed,
  inject,
  Injectable,
  Signal,
  WritableSignal,
} from '@angular/core';
import { IngredientBackendService } from '../services/backend/ingredient.service';
import { IngredientDocInBackend } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class IngredientDomainFacade {
  private ingredientBackendService = inject(IngredientBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientBackendService.ingredients;

  readonly ingredientsLoading = this.ingredientBackendService.loading;
  readonly ingredientsUpdating = this.ingredientBackendService.updating;
  readonly ingredientsDeleting = this.ingredientBackendService.deleting;

  readonly dbIngredientsNames = computed(() =>
    this.dbIngredients().map((ing) => ing.name),
  );

  deleteIngredient(ingredientId: string) {
    this.ingredientBackendService.deleteIngredientfromStore(ingredientId);
  }

  updateIngredient(
    ingredientId: string,
    propertiesToUpdate: object,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this.ingredientBackendService.updateIngredientInStore(
      ingredientId,
      propertiesToUpdate,
      mustPreserveState,
    );
  }
}
