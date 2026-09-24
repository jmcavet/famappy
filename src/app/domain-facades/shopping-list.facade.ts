import {
  computed,
  inject,
  Injectable,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ShoppingListBackendService } from '../services/backend/shopping-list.service';
import { ShoppingListDocInBackend } from '../models/shopping-list.model';

@Injectable({ providedIn: 'root' })
export class ShoppingListDomainFacade {
  private shoppingListBackendService = inject(ShoppingListBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbShoppingLists: Signal<ShoppingListDocInBackend[]> =
    this.shoppingListBackendService.shoppingLists;

  readonly shoppingListsLoading = this.shoppingListBackendService.loading;
  readonly shoppingListsUpdating = this.shoppingListBackendService.updating;
  readonly shoppingListsDeleting = this.shoppingListBackendService.deleting;
  readonly shoppingListsSaving = this.shoppingListBackendService.saving;

  readonly dbShoppingListsNames = computed(() =>
    this.dbShoppingLists().map((ing) => ing.name),
  );

  saveShoppingList(propertiesToSave: object) {
    this.shoppingListBackendService.saveShoppingListIntoStore(propertiesToSave);
  }

  updateShoppingList(
    shoppingListId: string,
    shoppingListName: string,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this.shoppingListBackendService.updateShoppingListInStore(
      shoppingListId,
      { name: shoppingListName },
      mustPreserveState,
    );
  }

  updateIngredientsInShoppingList(
    shoppingListId: string,
    updatedIngredients: any,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this.shoppingListBackendService.updateShoppingListInStore(
      shoppingListId,
      { ingredients: updatedIngredients },
      mustPreserveState,
    );
  }

  updateShoppingListCategories(
    shoppingListId: string,
    itemsIds: string[],
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this.shoppingListBackendService.updateShoppingListCategoriesInStore(
      shoppingListId,
      itemsIds,
      mustPreserveState,
    );
  }

  // deleteIngredient(ingredientId: string) {
  //   this.shoppingListBackendService.deleteIngredientfromStore(ingredientId);
  // }

  public async deleteShoppingListElement(
    shoppingListId: string,
    elementType: string,
    elementToRemove: string | { id: string | null; measure: number | null },
  ) {
    await this.shoppingListBackendService.deleteShoppingListElementfromStore(
      shoppingListId,
      elementType,
      elementToRemove,
    );
  }

  public async deleteShoppingList(shoppingListIdToDelete: string) {
    await this.shoppingListBackendService.deleteShoppingListFromStore(
      shoppingListIdToDelete,
    );
  }

  public async deleteQuickItem(quickItemId: string) {
    await this.shoppingListBackendService.deleteQuickItemfromStore(quickItemId);
  }
}
