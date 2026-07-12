import { computed, inject, Injectable, Signal } from '@angular/core';
import { ShoppingCategoryDocInBackend } from '../models/shopping-category.model';
import { ShoppingCategoryBackendService } from '../services/backend/shopping-category.service';

@Injectable({ providedIn: 'root' })
export class ShoppingCategoryDomainFacade {
  private shoppingCategoryBackendService = inject(
    ShoppingCategoryBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbShoppingCategories: Signal<ShoppingCategoryDocInBackend[]> =
    this.shoppingCategoryBackendService.shoppingCategories;

  readonly shoppingCategoriesLoading =
    this.shoppingCategoryBackendService.loading;
  readonly shoppingCategoriesUpdating =
    this.shoppingCategoryBackendService.updating;
  readonly shoppingCategoriesDeleting =
    this.shoppingCategoryBackendService.deleting;
  readonly shoppingCategoriesSaving =
    this.shoppingCategoryBackendService.saving;

  readonly dbShoppingCategoriesNames = computed(() =>
    this.dbShoppingCategories().map((ing) => ing.name),
  );

  saveShoppingCategory(propertiesToSave: object) {
    return this.shoppingCategoryBackendService.saveShoppingCategoryIntoStore(
      propertiesToSave,
    );
  }
}
