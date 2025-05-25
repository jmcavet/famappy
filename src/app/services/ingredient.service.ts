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
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import {
  IngredientWithIdAndDate,
  IngredientWithoutId,
} from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  firebaseService = inject(FirebaseService);

  private ingredientsSubject = new BehaviorSubject<IngredientWithIdAndDate[]>(
    []
  );
  ingredients$ = this.ingredientsSubject.asObservable();

  constructor() {
    this.loadIngredients();
  }

  private loadIngredients() {
    const colRef = collection(this.firebaseService.db, 'ingredients');

    // Query to get members sorted by 'dateCreated' (ascending)
    const ingredientsQuery = query(colRef, orderBy('dateCreated', 'asc'));

    onSnapshot(ingredientsQuery, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            dateCreated: doc.data()['dateCreated']?.toDate?.() ?? new Date(),
            ...doc.data(),
          } as IngredientWithIdAndDate)
      );
      this.ingredientsSubject.next(data);
    });
  }

  // Optionally expose value directly
  getIngredientsSnapshot() {
    return this.ingredientsSubject.getValue();
  }

  // Save the ingredient data to Firestore
  async saveIngredientIntoStore(
    newIngredient: IngredientWithoutId
  ): Promise<string | void> {
    try {
      console.log('TRY: ', newIngredient);
      const ingredientsCollection = collection(
        this.firebaseService.db,
        'ingredients'
      );

      const docRef = await addDoc(ingredientsCollection, {
        ...newIngredient,
        dateCreated: Timestamp.now(), // Add the current timestamp as dateCreated
      });

      // Return the document ID after it is created
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  // Update the ingredient data by ingredient id (in Firestore)
  async updateIngredientById(
    ingredientId: string,
    updatedIngredient: IngredientWithoutId
  ): Promise<string | void> {
    try {
      // Get a reference to the member document to update
      const ingredientDocRef = doc(
        this.firebaseService.db,
        'ingredients',
        ingredientId
      );

      await updateDoc(ingredientDocRef, {
        ...updatedIngredient,
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  // Update the ingredients data type (in Firestore)
  async updateIngredientsType(
    oldTypeId: string,
    newTypeId: string
  ): Promise<string | void> {
    try {
      // Get a reference to the ingredients collection
      const ingredientsColRef = collection(
        this.firebaseService.db,
        'ingredients'
      );

      const q = query(ingredientsColRef, where('typeId', '==', oldTypeId));
      const querySnapshot = await getDocs(q);

      for (const document of querySnapshot.docs) {
        const ingredientDocRef = doc(
          this.firebaseService.db,
          'ingredients',
          document.id
        );
        await updateDoc(ingredientDocRef, { typeId: newTypeId });
      }
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  // Remove the ingredient data to Firestore
  async removeIngredientStoreById(ingredientId: string): Promise<void> {
    console.log('ingredientId: ', ingredientId);
    try {
      // Get a reference to the document with the given ingredientId in the 'ingredients' collection
      const docRef = doc(this.firebaseService.db, 'ingredients', ingredientId);

      // Remove the document
      await deleteDoc(docRef);

      console.log(`Ingredient with ID ${ingredientId} successfully removed`);
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error('Failed to remove ingredient');
    }
  }

  // Remove the ingredients which 'type' attribute equals the 'ingredientType' passed as argument
  async removeIngredientsByTypeId(ingredientTypeId: string): Promise<void> {
    try {
      const ingredientsColRef = collection(
        this.firebaseService.db,
        'ingredients'
      );

      const q = query(
        ingredientsColRef,
        where('typeId', '==', ingredientTypeId)
      );
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((document) => {
        const ingredientDocRef = doc(
          this.firebaseService.db,
          'ingredients',
          document.id
        );
        return deleteDoc(ingredientDocRef);
      });

      await Promise.all(deletePromises);

      console.log(
        `All ingredients with type ID "${ingredientTypeId}" were successfully removed.`
      );
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error('Failed to remove ingredient');
    }
  }
}
