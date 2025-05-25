import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import {
  CuisineWithIdAndDate,
  MealCategoryWithIdAndDate,
  RecipeCategoryWithIdAndDate,
} from '../models/cuisine.model';
import { RecipeState } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  firebaseService = inject(FirebaseService);

  initialRecipeState: RecipeState = {
    title: '',
    preparationTime: 0,
    cookingTime: 0,
    servings: 4,
    difficulty: 'normal',
    price: 'normal',
    frequency: 'monthly',
    seasonsSelected: [''],
    recipeCategoriesSelected: [],
    mealCategory: 'none',
    cuisine: 'none',
    source: '',
    ingredients: [],
    ingredient: 'none',
    selectedTabTitle: 'definition',
    instructions: [],
    favorite: false,
  };

  /** Used to check the validity of the form */
  private isFormValidSubject = new BehaviorSubject<boolean>(false);
  isFormValid$ = this.isFormValidSubject.asObservable();

  /** Used to save the internal state of the recipe page component */
  private recipeStateSubject = new BehaviorSubject<RecipeState>(
    this.initialRecipeState
  );
  recipeState$ = this.recipeStateSubject.asObservable();

  get recipeState(): RecipeState {
    return this.recipeStateSubject.value;
  }

  /** Used to preserve Recipe state when navigating from the cuisine or meal category page (and saving a user
   * selection) back to the recipe page.
   */
  mustPreserveState: boolean = false;

  /** Used to save documents of collection 'cuisines' from firestore into internal state */
  private cuisinesSubject = new BehaviorSubject<CuisineWithIdAndDate[]>([]);
  cuisines$ = this.cuisinesSubject.asObservable();

  /** Used to save cuisine selected by user in cuisine page into recipe page internal state */
  private cuisineSubject = new BehaviorSubject<string>('none');
  cuisine$ = this.cuisineSubject.asObservable();

  /** Used to save documents of collection 'meal-categories' from firestore into internal state */
  private mealCategoriesSubject = new BehaviorSubject<
    MealCategoryWithIdAndDate[]
  >([]);
  mealCategories$ = this.mealCategoriesSubject.asObservable();

  /** Used to save documents of collection 'recipe-categories' from firestore into internal state */
  private recipeCategoriesSubject = new BehaviorSubject<
    RecipeCategoryWithIdAndDate[]
  >([]);
  recipeCategories$ = this.recipeCategoriesSubject.asObservable();

  /**
   Resets the application state object to its initial value. It is used on the ngOnInit method
   of the TabDefinitionComponent so that when this page is loaded, the state is initialized. However,
   when going back from the CuisineComponent and the MealCategoryPage pages, the state is preserved.
   */
  resetRecipeState() {
    this.recipeStateSubject.next(this.initialRecipeState);
  }

  updateRecipeState<key extends keyof RecipeState>(
    key: key,
    value: RecipeState[key]
  ) {
    this.recipeStateSubject.next({
      ...this.recipeState,
      [key]: value,
    });
  }

  setFormValidity(isValid: boolean): void {
    this.isFormValidSubject.next(isValid);
  }

  constructor() {
    /** Retrieve the cuisines, mealCategories and recipeCategories documents from firestore.
     * Firestore’s onSnapshot() is asynchronous and non-blocking, meaning each call starts a
     * listener immediately and independently. All three Firestore listeners start around the
     *  same time, without waiting for the others.
     */
    this.loadFirestoreCollection<CuisineWithIdAndDate>(
      'cuisines',
      this.cuisinesSubject
    );
    this.loadFirestoreCollection<MealCategoryWithIdAndDate>(
      'meal-categories',
      this.mealCategoriesSubject
    );
    this.loadFirestoreCollection<RecipeCategoryWithIdAndDate>(
      'recipe-categories',
      this.recipeCategoriesSubject
    );
  }

  private loadFirestoreCollection<T>(
    collectionName: string,
    subject: BehaviorSubject<T[]>
  ): void {
    console.log('Loading collection ', collectionName);
    const colRef = collection(this.firebaseService.db, collectionName);
    const colQuery = query(colRef, orderBy('dateCreated', 'asc'));

    onSnapshot(colQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        dateCreated: doc.data()['dateCreated']?.toDate?.() ?? new Date(),
        ...doc.data(),
      })) as T[];

      subject.next(data);
    });
  }

  getCuisinesSnapshot() {
    return this.cuisinesSubject.getValue();
  }

  setCuisine(cuisine: string) {
    this.cuisineSubject.next(cuisine);
  }

  getCuisineSelected() {
    return this.cuisineSubject.getValue();
  }

  /** Save a new object (name property only) in Firestore */
  async saveDocIntoFirestore(
    collectionName: string,
    newDoc: any
  ): Promise<string | void> {
    try {
      const myCollection = collection(this.firebaseService.db, collectionName);

      const docRef = await addDoc(myCollection, {
        ...newDoc,
        dateCreated: Timestamp.now(), // Add the current timestamp as dateCreated
      });

      // Return the document ID after it is created
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  /** Update a Firestore document (name property only) */
  async updateDocInFirestore(
    collectionName: string,
    idToUpdate: string,
    newName: string
  ): Promise<string | void> {
    try {
      const docRef = doc(this.firebaseService.db, collectionName, idToUpdate);
      await updateDoc(docRef, { name: newName });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  /** Remove a document from Firestore  */
  async deleteDocFromFirestore(
    collectionName: string,
    id: string
  ): Promise<void> {
    try {
      // Get a reference to the document with the given cuisineId in the 'cuisines' collection
      const docRef = doc(this.firebaseService.db, collectionName, id);

      // Remove the document
      await deleteDoc(docRef);

      console.log(
        `ID ${id} successfully removed from collection ${collectionName}`
      );
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error(
        `Failed to delete document from collection ${collectionName}`
      );
    }
  }
}
