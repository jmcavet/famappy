import { inject, Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
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
import { Member, MemberWithId } from '../pages/members-page/member/member.model';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  firebaseService = inject(FirebaseService);

  // Using a real-time listener to get members from Firestore
  getMembersFromStore(callback: (members: MemberWithId[]) => void): void {
    const membersCollection = collection(this.firebaseService.db, 'members');

    // Query to get members sorted by 'dateCreated' (ascending)
    const membersQuery = query(
      membersCollection,
      orderBy('dateCreated', 'asc')
    );

    // Use onSnapshot to listen to real-time updates
    onSnapshot(
      membersQuery,
      (querySnapshot) => {
        console.log('onSnapshot triggered'); // Check if this log is triggered

        const members: MemberWithId[] = []; // Define as Member[] instead of just an empty array type
        querySnapshot.forEach((doc) => {
          console.log('THIS IS MY DOC.DATA(): ', doc.data());
          members.push({ ...doc.data(), id: doc.id } as MemberWithId); // Ensure correct typing
        });
        callback(members); // Pass the updated members to the callback
      },
      (error) => {
        console.log('THIS IS MY ERROR: ', error);
      }
    );
  }

  // Save the member data to Firestore
  async saveMemberIntoStore(newMember: Member): Promise<string | void> {
    try {
      const membersCollection = collection(this.firebaseService.db, 'members');

      const docRef = await addDoc(membersCollection, {
        ...newMember,
        dateCreated: Timestamp.now(), // Add the current timestamp as dateCreated
      });

      // Return the document ID after it is created
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  // Save the member data to Firestore
  async updateMemberIntoStore(
    memberId: string,
    updatedMember: Member
  ): Promise<string | void> {
    try {
      // Get a reference to the member document to update
      const memberDocRef = doc(this.firebaseService.db, 'members', memberId);

      await updateDoc(memberDocRef, {
        ...updatedMember,
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  // Save the member data to Firestore
  async removeMemberStoreById(memberId: string): Promise<void> {
    console.log('memberId: ', memberId);
    try {
      // Get a reference to the document with the given memberId in the 'members' collection
      const docRef = doc(this.firebaseService.db, 'members', memberId);

      // Remove the document
      await deleteDoc(docRef);

      console.log(`Member with ID ${memberId} successfully removed`);
    } catch (e) {
      console.error('Error removing document: ', e);
      // Optionally, rethrow the error to be handled by the caller
      throw new Error('Failed to remove member');
    }
  }
}
