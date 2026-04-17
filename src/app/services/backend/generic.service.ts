import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

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
  where,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

import { BehaviorSubject } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import {
  Recipe,
  RecipeWithId,
} from '../../features/recipes/components/recipe-card/recipe.model';
import { deleteObject, ref } from 'firebase/storage';
import { CloseScrollStrategy } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  firebaseService = inject(FirebaseService);
  authService = inject(AuthService);

  private storageRefFromUrl(url: string) {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const pathMatch = decodeURIComponent(url)
      .replace(baseUrl, '')
      .split('?')[0]
      .split('/o/')[1];

    return ref(this.firebaseService.storage, pathMatch);
  }

  public loadFirestoreCollectionTest<T>(
    collectionName: string,
    signal: WritableSignal<T[]>,
    userId: string,
    onDataLoaded?: () => void,
  ): void {
    const user = this.authService.user();

    if (!user?.uid) throw new Error('Not authenticated');

    const colRef = collection(this.firebaseService.db, collectionName);
    const colQuery = query(
      colRef,
      where('userId', '==', user?.uid),
      orderBy('dateCreated', 'asc'),
    );

    onSnapshot(colQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const docData = doc.data();

        return {
          id: doc.id,
          ...docData,
          dateCreated: docData['dateCreated']?.toDate?.() ?? new Date(),
        };
      }) as T[];

      signal.set(data);

      // Notify once Firestore responds (even if the data is an empty array)
      if (onDataLoaded) onDataLoaded();
    });
  }

  // Save the document data into Firestore
  async saveDocumentIntoStore(
    collectionName: string,
    newDocument: object,
    onDataLoaded?: () => void,
  ): Promise<string | void> {
    console.log('THIS IS MY newDocument: ', newDocument);
    try {
      const collectionRef = collection(this.firebaseService.db, collectionName);

      const user = this.authService.user();

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const docRef = await addDoc(collectionRef, {
        ...newDocument,
        userId: user.uid,
        dateCreated: Timestamp.now(), // Add the current timestamp as dateCreated
      });

      // Notify once Firestore responds (even if the data is an empty array)
      if (onDataLoaded) onDataLoaded();

      // Return the document ID after it is created
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  async saveDocumentsIntoStore(
    collectionName: string,
    documents: object[],
  ): Promise<string[]> {
    const user = this.authService.user();

    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    const batch = writeBatch(this.firebaseService.db);
    const collectionRef = collection(this.firebaseService.db, collectionName);

    const docIds: string[] = [];

    documents.forEach((document) => {
      const docRef = doc(collectionRef);
      docIds.push(docRef.id);

      batch.set(docRef, {
        ...document,
        userId: user.uid,
        dateCreated: Timestamp.now(),
      });
    });

    await batch.commit();

    return docIds;
  }

  /** Update a Firestore document */
  async updateDocumentInFirestore(
    collectionName: string,
    idToUpdate: string,
    propertiesToUpdate: object,
    onDataLoaded?: () => void,
  ): Promise<string | void> {
    try {
      const user = this.authService.user();

      if (!user?.uid) throw new Error('Not authenticated');

      const docRef = doc(this.firebaseService.db, collectionName, idToUpdate);
      await updateDoc(docRef, { ...propertiesToUpdate, userId: user?.uid });

      // Notify once Firestore responds
      if (onDataLoaded) onDataLoaded();
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  /** Reset multiple Firestore documents */
  async updateMultipleDocumentsInFirestore(
    collectionName: string,
    documentsToUpdate: any[],
    propertiesToUpdate: any,
    onAllUpdatesComplete?: () => void,
  ): Promise<void> {
    const updates = documentsToUpdate.map(async (document) => {
      const docRef = doc(this.firebaseService.db, collectionName, document.id);
      try {
        const user = this.authService.user();

        if (!user?.uid) throw new Error('Not authenticated');

        await updateDoc(docRef, { ...propertiesToUpdate, userId: user?.uid });
        console.log('Updating document id: ', document.id);
      } catch (e) {
        console.error(`Error updating document ${document.id}: `, e);
      }
    });

    // Wait for all updates to complete
    await Promise.all(updates);

    if (onAllUpdatesComplete) onAllUpdatesComplete();
  }

  // TODO: refactor this method so that it becomes more generic...Seems difficult.
  /** Reset multiple Firestore documents */
  async removeIdsFromCollectionPropertyInFirestore(
    collectionName: string,
    documentsToUpdate: RecipeWithId[],
    documentIdToDelete: string,

    onAllUpdatesComplete?: () => void,
  ): Promise<void> {
    const updates = documentsToUpdate.map(async (document) => {
      const updatedProperty = document.recipeCategoryIds.filter(
        (id) => id !== documentIdToDelete,
      );

      const docRef = doc(this.firebaseService.db, collectionName, document.id);

      try {
        const user = this.authService.user();

        if (!user?.uid) throw new Error('Not authenticated');

        await updateDoc(docRef, {
          recipeCategoryIds: updatedProperty,
          userId: user?.uid,
        });
      } catch (e) {
        console.error(`Error updating ${document.id}: `, e);
      }
    });

    await Promise.all(updates);

    if (onAllUpdatesComplete) onAllUpdatesComplete();
  }

  /** Remove a document from Firestore  */
  async removeDocumentFromFirestore(
    collectionName: string,
    id: string,
    onDataLoaded?: () => void,
  ): Promise<void> {
    try {
      // Get a reference to the document with the given cuisineId in the 'cuisines' collection
      const docRef = doc(this.firebaseService.db, collectionName, id);

      // Remove the document
      await deleteDoc(docRef);

      console.log(
        `ID ${id} successfully removed from collection ${collectionName}`,
      );

      // Notify once Firestore responds
      if (onDataLoaded) onDataLoaded();
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error(
        `Failed to delete document from collection ${collectionName}`,
      );
    }
  }

  async removeImageUrlsFromFirebase(id: string) {
    const docRef = doc(this.firebaseService.db, 'recipes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const recipeData = docSnap.data();
      const imageUrl = recipeData['imageUrl'];
      const thumbnailUrl = recipeData['thumbnailUrl'];

      // 2. Delete the image from Firebase Storage
      if (imageUrl) {
        const imageRef = this.storageRefFromUrl(imageUrl);
        await deleteObject(imageRef);
        console.log('Deleted main image');
      }

      if (thumbnailUrl) {
        const thumbRef = this.storageRefFromUrl(thumbnailUrl);
        await deleteObject(thumbRef);
        console.log('Deleted thumbnail');
      }
    }
  }

  // Remove the ingredients which 'category' attribute equals the 'ingredientCategory' passed as argument
  async removeDocumentByPropertyId(
    collectionName: string,
    propertyIdName: string,
    propertyId: string,
    userId: string,
  ): Promise<void> {
    try {
      const ingredientsColRef = collection(
        this.firebaseService.db,
        collectionName,
      );

      const user = this.authService.user();

      if (!user?.uid) throw new Error('Not authenticated');

      const q = query(
        ingredientsColRef,
        where('userId', '==', user?.uid),
        where(propertyIdName, '==', propertyId),
      );
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((document) => {
        const docRef = doc(
          this.firebaseService.db,
          collectionName,
          document.id,
        );
        return deleteDoc(docRef);
      });

      await Promise.all(deletePromises);

      console.log(
        `All elements with ID "${propertyId}" were successfully removed.`,
      );
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error('Failed to remove ingredient');
    }
  }
}
