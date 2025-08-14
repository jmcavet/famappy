import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import { RecipeCategoryDocInBackend } from '../../models/cuisine.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeCategoryBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  recipeCategories = signal<RecipeCategoryDocInBackend[]>([]);

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
        this.loadRecipeCategoriesFromFirestore(user.uid);
      }
    });
  }

  loadRecipeCategoriesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollectionTest<RecipeCategoryDocInBackend>(
      'recipe-categories',
      this.recipeCategories,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      }
    );
  }

  /**
   * Saves a recipe category into the store.
   *
   * @param recipeCategoryName - The name of the recipeCategory (e.g. 'Kid friendly')
   */
  async saveRecipeCategoryIntoStore(recipeCategoryName: string) {
    const newRecipeCategory = {
      name: recipeCategoryName,
    };

    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'recipe-categories',
        newRecipeCategory,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        }
      );
      console.log('New recipe category document ID: ', docId);
    } catch (error) {
      console.error('Error saving recipe category: ', error);
    }
  }

  async updateRecipeCategoryInStore(
    recipeCategoryIdToUpdate: string,
    newRecipeCategoryName: string,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'recipe-categories',
        recipeCategoryIdToUpdate,
        { name: newRecipeCategoryName },
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        }
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating recipe category: ', error);
    }
  }

  async deleteRecipeCategoryInStore(recipeCategoryIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'recipe-categories',
        recipeCategoryIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        }
      );
    } catch (error) {
      console.error('Error deleting recipe category: ', error);
    }
  }
}
