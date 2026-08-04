import {
  computed,
  inject,
  Injectable,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ShoppingQuickItemBackendService } from '../services/backend/shopping-quick-item.service';
import { ShoppingQuickItemDocInBackend } from '../models/shopping-quick-item.model';

@Injectable({ providedIn: 'root' })
export class ShoppingQuickItemsDomainFacade {
  private shoppingQuickItemsBackendService = inject(
    ShoppingQuickItemBackendService,
  );

  /** Declaration of signals communicating with firestore */
  readonly dbShoppingQuickItems: Signal<ShoppingQuickItemDocInBackend[]> =
    this.shoppingQuickItemsBackendService.shoppingQuickItems;

  readonly shoppingQuickItemsLoading =
    this.shoppingQuickItemsBackendService.loading;
  readonly shoppingQuickItemsUpdating =
    this.shoppingQuickItemsBackendService.updating;
  readonly shoppingQuickItemsDeleting =
    this.shoppingQuickItemsBackendService.deleting;
  readonly shoppingQuickItemsSaving =
    this.shoppingQuickItemsBackendService.saving;

  readonly dbShoppingQuickItemNames = computed(() =>
    this.dbShoppingQuickItems().map((ing) => ing.name),
  );

  saveShoppingQuickItem(propertiesToSave: object) {
    this.shoppingQuickItemsBackendService.saveShoppingQuickItemIntoStore(
      propertiesToSave,
    );
  }

  // deleteShoppingCategoryItem(itemId: string) {
  //   this.shoppingQuickItemsBackendService.deleteShoppingCategoryItemfromStore(
  //     itemId,
  //   );
  // }

  public async updateQuickItem(
    quickItemIdToUpdate: string,
    newQuickItemName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    await this.shoppingQuickItemsBackendService.updateQuickItemInStore(
      quickItemIdToUpdate,
      newQuickItemName,
      mustPreserveState,
    );
  }
}
