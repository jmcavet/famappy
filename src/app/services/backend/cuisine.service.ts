import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './generic.service';
import { CuisineDocInBackend } from '../../models/cuisine.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CuisineBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  cuisines = signal<CuisineDocInBackend[]>([]);

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
        this.loadCuisinesFromFirestore(user.uid);
      }
    });
  }

  loadCuisinesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollectionTest<CuisineDocInBackend>(
      'cuisines',
      this.cuisines,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      }
    );
  }

  /**
   * Saves a cuisine into the store.
   *
   * @param cuisineName - The name of the cuisine (e.g. 'Italian')
   */
  async saveCuisineIntoStore(cuisineName: string) {
    const newCuisine = {
      name: cuisineName,
    };

    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'cuisines',
        newCuisine,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        }
      );
      console.log('New cuisine document ID: ', docId);
    } catch (error) {
      console.error('Error saving cuisine: ', error);
    }
  }

  async updateCuisineInStore(
    cuisineIdToUpdate: string,
    newCuisineName: string,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'cuisines',
        cuisineIdToUpdate,
        { name: newCuisineName },
        () => {
          // This callback runs once Firestore returns
          this._updating.set(false);
        }
      );

      // .....
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating cuisine: ', error);
    }
  }

  async deleteCuisineInStore(cuisineIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'cuisines',
        cuisineIdToDelete,
        () => {
          // This callback runs once Firestore returns
          this._deleting.set(false);
        }
      );
    } catch (error) {
      console.error('Error deleting cuisine: ', error);
    }
  }
}
