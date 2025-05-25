import { inject, Injectable } from '@angular/core';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import {
  IngredientType,
  IngredientTypeWithDate,
  IngredientTypeWithoutId,
} from '../models/ingredient-type.model';

@Injectable({ providedIn: 'root' })
export class IngredientTypeService {
  firebaseService = inject(FirebaseService);

  private ingredientTypesSubject = new BehaviorSubject<
    IngredientTypeWithDate[]
  >([]);
  ingredientTypes$ = this.ingredientTypesSubject.asObservable();

  private ingredientTypeSelectedSubject = new BehaviorSubject<
    IngredientType | undefined
  >(undefined);
  ingredientTypeSelected$ = this.ingredientTypeSelectedSubject.asObservable();

  constructor() {
    this.loadIngredientTypes();
  }

  private loadIngredientTypes() {
    const colRef = collection(this.firebaseService.db, 'ingredientTypes');

    // Query to get ingredient types sorted by 'dateCreated' (ascending)
    const ingredientTypesQuery = query(colRef, orderBy('dateCreated', 'asc'));

    onSnapshot(ingredientTypesQuery, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            dateCreated: doc.data()['dateCreated']?.toDate?.() ?? new Date(),
            ...doc.data(),
          } as IngredientTypeWithDate)
      );
      this.ingredientTypesSubject.next(data);
    });
  }

  // Optionally expose value directly
  getIngredientTypesSnapshot() {
    return this.ingredientTypesSubject.getValue();
  }

  setSelectedType(type: IngredientType | undefined) {
    console.log('Type selected: ', type);
    this.ingredientTypeSelectedSubject.next(type);
  }

  // Save the ingredient data to Firestore
  async saveIngredientTypeIntoStore(
    newIngredientType: IngredientTypeWithoutId
  ): Promise<string | void> {
    try {
      const ingredientTypesCollection = collection(
        this.firebaseService.db,
        'ingredientTypes'
      );

      const docRef = await addDoc(ingredientTypesCollection, {
        ...newIngredientType,
        dateCreated: Timestamp.now(), // Add the current timestamp as dateCreated
      });

      // Return the document ID after it is created
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  // Update the ingredient type data in Firestore
  async updateIngredientTypeIntoStore(
    ingredientTypeId: string,
    updatedIngredientType: IngredientTypeWithoutId
  ): Promise<string | void> {
    try {
      // Get a reference to the member document to update
      const ingredientTypeDocRef = doc(
        this.firebaseService.db,
        'ingredientTypes',
        ingredientTypeId
      );

      await updateDoc(ingredientTypeDocRef, {
        ...updatedIngredientType,
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  // Remove the ingredient data to Firestore
  async removeIngredientTypeStoreById(ingredientTypeId: string): Promise<void> {
    try {
      // Get a reference to the document with the given ingredientId in the 'ingredients' collection
      const docRef = doc(
        this.firebaseService.db,
        'ingredientTypes',
        ingredientTypeId
      );

      // Remove the document
      await deleteDoc(docRef);

      console.log(
        `Ingredient with ID ${ingredientTypeId} successfully removed`
      );
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error('Failed to remove ingredient');
    }
  }
}
