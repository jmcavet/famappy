import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import { MealCategoryDocInBackend } from '../../models/cuisine.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MealCategoryBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  mealCategories = signal<MealCategoryDocInBackend[]>([]);

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
        this.loadMealCategoriesFromFirestore(user.uid);
      }
    });
  }

  loadMealCategoriesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<MealCategoryDocInBackend>(
      'meal-categories',
      this.mealCategories,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves a mealCategory into the store.
   *
   * @param mealCategoryName - The name of the meal category (e.g. 'Salsa')
   */
  async saveMealCategoryIntoStore(mealCategoryName: string) {
    const newMealCategory = {
      name: mealCategoryName,
    };

    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'meal-categories',
        newMealCategory,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New meal category document ID: ', docId);
    } catch (error) {
      console.error('Error saving meal category: ', error);
    }
  }

  async updateMealCategoryInStore(
    mealCategoryIdToUpdate: string,
    newMealCategoryName: string,
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'meal-categories',
        mealCategoryIdToUpdate,
        { name: newMealCategoryName },
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        },
      );
    } catch (error) {
      console.error('Error updating meal category: ', error);
    }
  }

  async deleteMealCategoryInStore(mealCategoryIdToDelete: string) {
    this._deleting.set(true);

    try {
      // TODO: refactor later
      // // If the user has selected a specific meal category (e.g. main course) in the /meal-category page, which corresponds to
      // // the meal category that is about to be deleted, make sure to delete it and replace it by 'none'
      // const mealCategoryNameDeleted = this.mealCategories().find(
      //   (mealCategory) => mealCategory.id === mealCategoryIdToDelete,
      // );
      // if (mealCategoryId === mealCategoryNameDeleted?.id) {
      //   updateProperty('mealCategoryId', 'none');
      // }

      await this.firestoreService.removeDocumentFromFirestore(
        'meal-categories',
        mealCategoryIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        },
      );
    } catch (error) {
      console.error('Error deleting cuisine: ', error);
    }
  }
}
