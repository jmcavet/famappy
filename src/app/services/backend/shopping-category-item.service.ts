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
import { ShoppingCategoryItemDocInBackend } from '../../models/shopping-category-item.model';

@Injectable({ providedIn: 'root' })
export class ShoppingCategoryItemBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  readonly shoppingCategoryItems = signal<ShoppingCategoryItemDocInBackend[]>(
    [],
  );

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
        this.loadShoppingCategoryItemsFromFirestore(user.uid);
      }
    });
  }

  private loadShoppingCategoryItemsFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<ShoppingCategoryItemDocInBackend>(
      'shopping-category-items',
      this.shoppingCategoryItems,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves a shopping category into the store.
   *
   * @param propertiesToSave - Properties to save
   */
  async saveShoppingCategoryItemIntoStore(propertiesToSave: object) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'shopping-category-items',
        propertiesToSave,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New shopping category item document ID: ', docId);
    } catch (error) {
      console.error('Error saving shopping category item: ', error);
    }
  }
}
