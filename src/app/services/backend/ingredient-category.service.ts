import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import {
  IngredientType,
  IngredientTypeWithDate,
} from '../../models/ingredient-type.model';
import { AuthService } from './auth.service';
import { IngredientCategoryDocInBackend } from '../../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class IngredientCategoryBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  /** Make the signal readonly, it avoids accidental mutations outside the service. */
  readonly ingredientCategories = signal<IngredientCategoryDocInBackend[]>([]);
  ingredientCategorySelected = signal<IngredientType | undefined>(undefined);

  private readonly _loading = signal<boolean>(true);
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
        this.loadIngredientCategoriesFromFirestore(user.uid);
      }
    });
  }

  loadIngredientCategoriesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollectionTest<IngredientTypeWithDate>(
      'ingredient-categories',
      this.ingredientCategories,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      }
    );
  }

  setSelectedIngredientCategory(category: IngredientType | undefined) {
    this.ingredientCategorySelected.set(category);
  }

  /**
   * Saves an ingredient category into the store.
   *
   * @param ingredientCategoryName - The name of the ingredientCategory (e.g. 'fruit')
   */
  async saveRecipeCategoryIntoStore(ingredientCategoryName: string) {
    const newIngredientCategory = {
      name: ingredientCategoryName,
    };

    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'ingredient-categories',
        newIngredientCategory,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        }
      );
      console.log('New ingredient category document ID: ', docId);
    } catch (error) {
      console.error('Error saving ingredient category: ', error);
    }
  }

  async updateIngredientCategoryInStore(
    ingredientCategoryIdToUpdate: string,
    newIngredientCategoryName: string,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'ingredient-categories',
        ingredientCategoryIdToUpdate,
        { name: newIngredientCategoryName },
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        }
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating ingredient category: ', error);
    }
  }

  async deleteIngredientCategoryInStore(IngredientCategoryIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'ingredient-categories',
        IngredientCategoryIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        }
      );
    } catch (error) {
      console.error('Error deleting ingredient category: ', error);
    }
  }
}
