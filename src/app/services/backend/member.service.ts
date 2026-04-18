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
import { MemberWithId } from '../../features/members/components/member/member.model';

@Injectable({
  providedIn: 'root',
})
export class MemberBackendService {
  firebaseService = inject(FirebaseService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  members = signal<MemberWithId[]>([]);

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
        this.loadMembersFromFirestore(user.uid);
      }
    });
  }

  loadMembersFromFirestore(userId: string) {
    this._loading.set(true);

    this.firestoreService.loadFirestoreCollection<any>(
      'members',
      this.members,
      userId,
      () => {
        // This callback runs once Firestore returns data (even empty)
        this._loading.set(false);
      },
    );
  }

  /**
   * Saves a member into the store.
   *
   * @param member - member object
   */
  async saveMemberIntoStore(member: any) {
    this._saving.set(true);

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'members',
        member,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._saving.set(false);
        },
      );
      console.log('New member document ID: ', docId);
    } catch (error) {
      console.error('Error saving member: ', error);
      this._saving.set(false);
    }
  }

  /**
   * Update a member in the store.
   *
   * @param memberIdToUpdate - Id of the recipe to update
   * @param recipeObject - Recipe object
   */
  async updateMemberInStore(memberIdToUpdate: string, memberObject: any) {
    this._updating.set(true);

    try {
      await this.firestoreService.updateDocumentInFirestore(
        'members',
        memberIdToUpdate,
        memberObject,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._updating.set(false);
        },
      );
    } catch (error) {
      console.error('Error updating member: ', error);
      this._updating.set(false);
    }
  }

  /**
   * Remove a member from the store.
   *
   * @param memberIdToDelete - Id of the member to update
   */
  async removeMemberFromStore(memberIdToDelete: string) {
    this._deleting.set(true);

    try {
      await this.firestoreService.removeDocumentFromFirestore(
        'members',
        memberIdToDelete,
        () => {
          // This callback runs once Firestore returns data (even empty)
          this._deleting.set(false);
        },
      );
    } catch (error) {
      console.error('Error deleting member: ', error);
      this._deleting.set(false);
    }
  }
}
