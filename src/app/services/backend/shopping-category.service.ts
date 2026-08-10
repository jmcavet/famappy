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
import { ShoppingCategoryDocInBackend } from '../../models/shopping-category.model';

@Injectable({ providedIn: 'root' })
export class ShoppingCategoryBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  readonly shoppingCategories = signal<ShoppingCategoryDocInBackend[]>([]);

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
        this.loadShoppingCategoriesFromFirestore(user.uid);
      }
    });
  }

  private loadShoppingCategoriesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<ShoppingCategoryDocInBackend>(
      'shopping-categories',
      this.shoppingCategories,
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
  async saveShoppingCategoryIntoStore(propertiesToSave: object) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'shopping-categories',
        propertiesToSave,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New shopping category document ID: ', docId);
      return docId;
    } catch (error) {
      console.error('Error saving shopping category: ', error);
    }
  }
}
