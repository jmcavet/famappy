import { inject, Injectable, signal } from '@angular/core';

import { FirebaseService } from './firebase.service';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);

  userName = signal<string>('');

  updateName(newName: string) {
    // Update the signal with a new string value
    console.log('UPDATING THE NAME WITH: ', newName);
    this.userName.set(newName);
  }

  firebaseservice = inject(FirebaseService);

  constructor() {
    onAuthStateChanged(this.firebaseservice.auth, async (authUser) => {
      if (!authUser) {
        this.user.set(null);
        return;
      }

      const user = await this.getUserInfo(authUser.uid);
      this.user.set(user);
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

  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.firebaseservice.auth,
      email,
      password
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.firebaseservice.auth,
      email,
      password
    );
  }

  logout() {
    return signOut(this.firebaseservice.auth);
  }

  // constructor(private firebaseAuth: Auth) {}
  // register(
  //   email: string,
  //   username: string,
  //   password: string
  // ): Observable<void> {
  //   const promise = createUserWithEmailAndPassword(
  //     this.firebaseAuth,
  //     email,
  //     password
  //   )
  //     .then((response) => {
  //       console.log('This is my response', response);
  //       updateProfile(response.user, { displayName: username });
  //     })
  //     .catch((error) => {
  //       console.log('This is my error: ', error);
  //     });
  //   return from(promise);
  // }
  // register(
  //   email: string,
  //   username: string,
  //   password: string
  // ): Observable<void> {
  //   // Create an observable from the Firebase promise
  //   const registrationObservable = createUserWithEmailAndPassword(
  //     this.firebaseAuth,
  //     email,
  //     password
  //   ).then((response) => {
  //     // After successful registration, update the profile
  //     return updateProfile(response.user, { displayName: username });
  //   });
  //   // Return the observable of the promise
  //   return from(registrationObservable)
  //     .pipe
  //     // Here you can map or handle errors, etc., if needed
  //     ();
  // }
}
