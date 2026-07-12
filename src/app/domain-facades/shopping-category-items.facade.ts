import { computed, inject, Injectable, Signal } from '@angular/core';
import { ShoppingCategoryItemDocInBackend } from '../models/shopping-category-item.model';
import { ShoppingCategoryItemBackendService } from '../services/backend/shopping-category-item.service';

@Injectable({ providedIn: 'root' })
export class ShoppingCategoryItemsDomainFacade {
  private shoppingCategoryItemsBackendService = inject(
    ShoppingCategoryItemBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbShoppingCategoryItems: Signal<ShoppingCategoryItemDocInBackend[]> =
    this.shoppingCategoryItemsBackendService.shoppingCategoryItems;

  readonly shoppingCategoryItemsLoading =
    this.shoppingCategoryItemsBackendService.loading;
  readonly shoppingCategoryItemsUpdating =
    this.shoppingCategoryItemsBackendService.updating;
  readonly shoppingCategoryItemsDeleting =
    this.shoppingCategoryItemsBackendService.deleting;
  readonly shoppingCategoryItemsSaving =
    this.shoppingCategoryItemsBackendService.saving;

  readonly dbShoppingCategoriesNames = computed(() =>
    this.dbShoppingCategoryItems().map((ing) => ing.name),
  );

  saveShoppingCategoryItem(propertiesToSave: object) {
    this.shoppingCategoryItemsBackendService.saveShoppingCategoryItemIntoStore(
      propertiesToSave,
    );
  }
}
