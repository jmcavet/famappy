import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseService } from './firebase.service';
import { IngredientDocInBackend } from '../../models/ingredient.model';
import { FirestoreService } from './generic.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class IngredientBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  readonly ingredients = signal<IngredientDocInBackend[]>([]);

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
        this.loadIngredientsFromFirestore(user.uid);
      }
    });
  }

  private loadIngredientsFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollectionTest<IngredientDocInBackend>(
      'ingredients',
      this.ingredients,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      }
    );
  }

  /**
   * Saves an ingredient into the store.
   *
   * @param ingredientName - The name of the ingredient (e.g. 'Avocado')
   */
  async saveIngredientIntoStore(propertiesToSave: object) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'ingredients',
        propertiesToSave,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        }
      );
      console.log('New ingredient document ID: ', docId);
    } catch (error) {
      console.error('Error saving ingredient: ', error);
    }
  }

  /**
   * Update an ingredient in the store.
   *
   * @param ingredientIdToUpdate - The id of the ingredient to update
   * @param propertiesToUpdate - The properties of the new ingredient to update (name and categoryId)
   */
  async updateIngredientInStore(
    ingredientIdToUpdate: string,
    propertiesToUpdate: object,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'ingredients',
        ingredientIdToUpdate,
        propertiesToUpdate,
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        }
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating ingredient: ', error);
    }
  }

  /**
   * Delete an ingredient from the store.
   *
   * @param ingredientIdToDelete - The id of the ingredient to delete
   */
  async deleteIngredientfromStore(ingredientIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'ingredients',
        ingredientIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        }
      );
    } catch (error) {
      console.error('Error deleting ingredient: ', error);
    }
  }
}
