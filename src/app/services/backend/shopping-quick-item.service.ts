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
import { ShoppingQuickItemDocInBackend } from '../../models/shopping-quick-item.model';

@Injectable({ providedIn: 'root' })
export class ShoppingQuickItemBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  readonly shoppingQuickItems = signal<ShoppingQuickItemDocInBackend[]>([]);

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
        this.loadShoppingQuickItemsFromFirestore(user.uid);
      }
    });
  }

  private loadShoppingQuickItemsFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<ShoppingQuickItemDocInBackend>(
      'shopping-quick-items',
      this.shoppingQuickItems,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves a shopping quick into the store.
   *
   * @param propertiesToSave - Properties to save
   */
  async saveShoppingQuickItemIntoStore(propertiesToSave: object) {
    this._saving.set(true);

    console.log('propertiesToSave: ', propertiesToSave);
    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'shopping-quick-items',
        propertiesToSave,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New shopping quick item document ID: ', docId);
    } catch (error) {
      console.error('Error saving shopping quick item: ', error);
    }
  }

  // async updateShoppingCategoryItemsInStore(
  //   itemsToUpdate: ShoppingCategoryItem[],
  //   mustPreserveState: WritableSignal<boolean>,
  // ) {
  //   this._updating.set(true);

  //   try {
  //     await this.firestoreService.updateDocumentsInFirestore(
  //       'shopping-category-items',
  //       itemsToUpdate.map((item) => ({
  //         id: item.id,
  //         properties: { name: item.name },
  //       })),
  //       () => {
  //         // This callback runs once Firestore returns
  //         this._updating.set(false);
  //       },
  //     );

  //     mustPreserveState.set(true);
  //   } catch (error) {
  //     console.error('Error updating shopping category item: ', error);
  //   }
  // }

  // /**
  //  * Delete a shopping category item from the store.
  //  *
  //  * @param itemIdToDelete - The id of the item to delete
  //  */
  // async deleteShoppingCategoryItemfromStore(itemIdToDelete: string) {
  //   this._deleting.set(true);

  //   try {
  //     await this.firestoreService.removeDocumentFromFirestore(
  //       'shopping-category-items',
  //       itemIdToDelete,
  //       () => {
  //         // This callback runs once Firestore returns
  //         this._deleting.set(false);
  //       },
  //     );
  //   } catch (error) {
  //     console.error('Error deleting item: ', error);
  //   }
  // }
}
