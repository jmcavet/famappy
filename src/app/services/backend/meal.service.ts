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
import { RecipeWithId } from '../../features/recipes/components/recipe-card/recipe.model';
import {
  getDownloadURL,
  StorageReference,
  uploadBytesResumable,
} from 'firebase/storage';
import { NgxImageCompressService } from 'ngx-image-compress';
import {
  Meal,
  MealDocInBackend,
  MealDocWithIdInBackend,
} from '../../features/meals/state/mealCart.model';

@Injectable({
  providedIn: 'root',
})
export class MealBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private imageCompress = inject(NgxImageCompressService);

  meals = signal<MealDocWithIdInBackend[]>([]);

  private readonly _loading = signal<boolean>(true);
  readonly loading = this._loading.asReadonly();

  private readonly _saving = signal<boolean>(false);
  readonly saving = this._saving.asReadonly();

  private readonly _updating = signal<boolean>(false);
  readonly updating = this._updating.asReadonly();

  private readonly _deleting = signal<boolean>(false);
  readonly deleting = this._deleting.asReadonly();

  private _uploadProgress = signal(0);
  public uploadProgress = this._uploadProgress.asReadonly();

  constructor() {
    effect(() => {
      const user = this.authService.user();

      if (user) {
        this.loadMealsFromFirestore(user.uid);
      }
    });
  }

  loadMealsFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<MealDocInBackend>(
      'meals',
      this.meals,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves meals into the store.
   *
   * @param meals - array of meals objects
   */
  async saveMealsIntoStore(meals: Meal[]) {
    this._saving.set(true);

    try {
      const payload: MealDocInBackend[] = meals.map((meal) => ({
        weekDay: meal.weekDay,
        recipeId: meal.recipe?.id ?? null,
        mealType: meal.mealType,
        servings: meal.servings,
        cookId: meal.cookId,
        manualRecipe: meal.manualRecipe,
      }));

      const docIds = await this.firestoreService.saveDocumentsIntoStore(
        'meals',
        payload,
      );
      console.log('New meal documents IDs: ', docIds);

      return docIds;
    } catch (error) {
      console.error('Error saving meals: ', error);
      throw error;
    } finally {
      this._saving.set(false);
    }
  }

  /**
   * Delete a meal from the store.
   *
   * @param mealIdToDelete - The id of the meal to delete
   */
  async deleteMealFromStore(mealIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'meals',
        mealIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        },
      );
    } catch (error) {
      console.error('Error deleting meal: ', error);
    }
  }

  /**
   * Update a meal in the store.
   *
   * @param mealIdToUpdate - The id of the meal to update
   * @param propertiesToUpdate - The properties of the new meal to update
   */
  async updateMealInStore(
    mealIdToUpdate: string,
    propertiesToUpdate: Partial<MealDocInBackend>,
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'meals',
        mealIdToUpdate,
        propertiesToUpdate,
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        },
      );
    } catch (error) {
      console.error('Error updating meal: ', error);
    }
  }
}
