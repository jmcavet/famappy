import { inject, Injectable, signal, WritableSignal } from '@angular/core';

import { FirebaseService } from './firebase.service';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Services */
  firebaseservice = inject(FirebaseService);

  /** State signals */
  user = signal<User | null>(null);
  userName = signal<string>('');
  isLoggingIn = signal<boolean>(false);
  isSigningUp = signal<boolean>(false);

  updateName(newName: string) {
    // Update the signal with a new string value
    this.userName.set(newName);
  }

  constructor() {
    onAuthStateChanged(this.firebaseservice.auth, async (authUser) => {
      if (!authUser) {
        this.user.set(null);
        return;
      }

      const user = await this.getUserInfo(authUser.uid);
      if (user) {
        this.user.set({ ...user, uid: authUser.uid });
      } else {
        this.user.set(null);
      }
    });
  }

  async getUserInfo(uid: string): Promise<User | null> {
    const userRef = doc(this.firebaseservice.db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  }

  async signupWithProfileAndMetadata(
    email: string,
    password: string,
    familyName: string
  ): Promise<UserCredential> {
    try {
      this.isSigningUp.set(true);

      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseservice.auth,
        email,
        password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: familyName });

      // Write user metadata to Firestore
      await setDoc(doc(this.firebaseservice.db, 'users', user.uid), {
        familyName,
        email,
        createdAt: new Date(),
      });
      return userCredential;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      this.isSigningUp.set(false);
    }
  }

  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      this.isLoggingIn.set(true);

      const userCredential = await signInWithEmailAndPassword(
        this.firebaseservice.auth,
        email,
        password
      );

      const user = userCredential.user;
      console.log('USER: ', user);

      if (user.displayName) {
        await this.updateName(user.displayName);
      }

      return userCredential;
    } catch (error) {
      console.error('Logging failed:', error);
      throw error;
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  logout() {
    return signOut(this.firebaseservice.auth);
  }
}
