import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import { AuthService } from './auth.service';
import { ShoppingListDocInBackend } from '../../models/shopping-list.model';
import { ShoppingListElement } from '../../features/shopping/shopping.facade';

@Injectable({ providedIn: 'root' })
export class ShoppingListBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  readonly shoppingLists = signal<ShoppingListDocInBackend[]>([]);

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _saving = signal<boolean>(false);
  readonly saving = this._saving.asReadonly();

  private readonly _updating = signal<boolean>(false);
  readonly updating = this._updating.asReadonly();

  private readonly _deleting = signal<boolean>(false);
  readonly deleting = this._deleting.asReadonly();

  constructor() {
    effect(() => {
      const user = this.authService.user();

      if (user) {
        this.loadShoppingListsFromFirestore(user.uid);
      }
    });
  }

  private loadShoppingListsFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<ShoppingListDocInBackend>(
      'shopping-lists',
      this.shoppingLists,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves a shopping list into the store.
   *
   * @param propertiesToSave - Properties to save
   */
  async saveShoppingListIntoStore(propertiesToSave: object) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'shopping-lists',
        propertiesToSave,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New shopping list document ID: ', docId);
    } catch (error) {
      console.error('Error saving shopping list: ', error);
    }
  }

  /**
   * Update an ingredient in the store.
   *
   * @param shoppingListIdToUpdate - The id of the shopping list to update
   * @param propertiesToUpdate - The properties of the new shopping list to update
   */
  async updateShoppingListInStore(
    shoppingListIdToUpdate: string,
    propertiesToUpdate: object,
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'shopping-lists',
        shoppingListIdToUpdate,
        propertiesToUpdate,
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        },
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating shopping list: ', error);
    }
  }

  async updateShoppingListCategoriesInStore(
    shoppingListIdToUpdate: string,
    itemsIds: string[],
    mustPreserveState: WritableSignal<boolean>,
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'shopping-lists',
        shoppingListIdToUpdate,
        {
          items: itemsIds,
        },
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        },
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating shopping list: ', error);
    }
  }

  // /**
  //  * Delete an ingredient from the store.
  //  *
  //  * @param ingredientIdToDelete - The id of the ingredient to delete
  //  */
  // async deleteIngredientfromStore(ingredientIdToDelete: string) {
  //   this._deleting.set(true);

  //   try {
  //     await this.firestoreService.removeDocumentFromFirestore(
  //       'ingredients',
  //       ingredientIdToDelete,
  //       () => {
  //         // This callback runs once Firestore returns
  //         this._deleting.set(false);
  //       },
  //     );
  //   } catch (error) {
  //     console.error('Error deleting ingredient: ', error);
  //   }
  // }

  /**
   * Delete an shopping list ingredient/item from the store. It removes it either from the 'ingredients' or 'items' array of ids.
   *
   * @param itemIdToDelete - The id of the ingredient/item to delete
   */
  async deleteShoppingListElementfromStore(
    shoppingListId: string,
    elementType: string,
    elementToRemove: string | { id: string | null; measure: number | null },
  ) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeItemFromArrayProperty(
        'shopping-lists',
        shoppingListId,
        elementType,
        elementToRemove,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        },
      );
    } catch (error) {
      console.error('Error removing item from shopping list document: ', error);
    }
  }

  async deleteQuickItemfromStore(quickItemId: string) {
    this._deleting.set(true);

    if (quickItemId) {
      try {
        await this.firestoreService.removeDocumentFromFirestore(
          'shopping-quick-items',
          quickItemId,
          () => {
            // This callback runs once Firestore returns
            this._deleting.set(false);
          },
        );
      } catch (error) {
        console.error('Error removing quick item: ', error);
      }
    }
  }
}
