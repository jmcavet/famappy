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
import { RecipeDocInBackend } from '../../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private imageCompress = inject(NgxImageCompressService);

  recipes = signal<RecipeWithId[]>([]);

  private readonly _loading = signal<boolean>(false);
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
        this.loadRecipesFromFirestore(user.uid);
      }
    });
  }

  loadRecipesFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollectionTest<any>(
      'recipes',
      this.recipes,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      }
    );
  }

  /**
   * Saves a recipe into the store.
   *
   * @param recipe - Recipe object
   */
  async saveRecipeIntoStore(recipe: RecipeDocInBackend) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'recipes',
        recipe,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        }
      );
      console.log('New recipe document ID: ', docId);

      return docId;
    } catch (error) {
      console.error('Error saving recipe: ', error);
    }
  }

  /**
   * Update a recipe in the store.
   *
   * @param recipeIdToUpdate - Id of the recipe to update
   * @param recipeObject - Recipe object
   * @param mustPreserveState -
   */
  async updateRecipeInStore(
    recipeIdToUpdate: string,
    recipeObject: any,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'recipes',
        recipeIdToUpdate,
        recipeObject,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._updating.set(false);
        }
      );

      // If the user has selected a specific recipe (e.g. main course) in the /meal-category page, which corresponds to
      // the original meal category name that has been updated, make sure to preserve the state
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating recipe: ', error);
    }
  }

  /**
   * Update a recipe in the store.
   *
   * @param recipesToUpdate - recipes (object) which cuisine property must be reset to 'none'
   * @param propertiesToUpdate - the properties of the recipes' documents (e.g. cuisineId, mealCategoryId)
   * @param mustPreserveState -
   */
  async resetRecipesPropertiesInStore(
    recipesToUpdate: any,
    propertiesToUpdate: any,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateMultipleDocumentsInFirestore(
        'recipes',
        recipesToUpdate,
        propertiesToUpdate,
        () => {
          this._updating.set(false); // callback after all updates finish
        }
      );
      console.log('Documents have been succesfully deleted...');
      mustPreserveState.set(true);
    } catch (error) {
      console.error('Error updating recipe: ', error);
      this._updating.set(false);
    }
  }

  async updateRecipesAfterDeletingRecipeCategoryId(
    recipesToUpdate: RecipeWithId[],
    recipeCategoryIdToDelete: string,
    mustPreserveState: WritableSignal<boolean>
  ) {
    this._updating.set(true);

    try {
      await this.firestoreService.removeIdsFromCollectionPropertyInFirestore(
        'recipes',
        recipesToUpdate,
        recipeCategoryIdToDelete,
        () => {
          this._updating.set(false); // callback after all updates finish
        }
      );
      console.log(
        'The recipes recipeCategoryIds have been succesfully updated...'
      );
      mustPreserveState.set(true);
    } catch (error) {
      console.error(
        'Error updating recipe recipeCategoryIds property: ',
        error
      );
      this._updating.set(false);
    }
  }

  /**
   * Remove a recipe from the store.
   *
   * @param recipeIdToUpdate - Id of the recipe to update
   */
  async removeRecipeFromStore(recipeIdToDelete: string) {
    // 1. remove the recipe image and thumbnail urls (if previously saved) from firebase
    this._deleting.set(true);
    try {
      await this.firestoreService.removeImageUrlsFromFirebase(recipeIdToDelete);
    } catch (error) {
      console.error('Error deleting image url from firebase: ', error);
    } finally {
      this._deleting.set(false);
    }

    // 2. Remove the recipe from firestore ('recipes' collection)
    this._deleting.set(true);
    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'recipes',
        recipeIdToDelete,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._deleting.set(false);
        }
      );
    } catch (error) {
      console.error('Error deleting recipe: ', error);
    }
  }

  // /**
  //  * Upload a recipe image into Firebase.
  //  *
  //  * @param imageRef - ...
  //  * @param thumbnailRef - ...
  //  * @param imageFile - ...
  //  */
  async uploadImageToFirebase(
    imageRef: StorageReference,
    thumbnailRef: StorageReference,
    imageFile: File
  ): Promise<void> {
    this._saving.set(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);

      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Compress full version (50% quality)
      const compressedImage = await this.imageCompress.compressFile(
        dataUrl,
        -1,
        50,
        50
      );

      // Create thumbnail version (10% size & quality)
      const thumbnailImage = await this.imageCompress.compressFile(
        dataUrl,
        -1,
        10,
        10
      );

      const fullBlob = this.dataUrlToBlob(compressedImage);
      const thumbBlob = this.dataUrlToBlob(thumbnailImage);

      await new Promise<void>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(imageRef, fullBlob, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=86400',
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this._uploadProgress.set(progress);
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          () => {
            console.log('Upload completed');
            resolve();
          }
        );
      });

      await new Promise<void>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(thumbnailRef, thumbBlob, {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=86400',
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this._uploadProgress.set(progress);
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          () => {
            console.log('Upload completed');
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image in firebase: ', error);
    } finally {
      this._saving.set(false);
    }
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Download a recipe image URL from Firebase.
   *
   * @param storageRef - ...
   */
  async downloadImageUrlFromFirebase(storageRef: any) {
    this._saving.set(true);

    try {
      const imageUrl = await getDownloadURL(storageRef);

      this._saving.set(false);

      return imageUrl;
    } catch (error) {
      console.error('Error downloading Url image from firebase: ', error);

      return null;
    }
  }
}
