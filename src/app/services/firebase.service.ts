import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'famappy-6181c',
  appId: '1:998789579438:web:77674387cf299adfdda33f',
  storageBucket: 'famappy-6181c.firebasestorage.app',
  apiKey: 'AIzaSyCFHTJvWi_BqBV3fwXB8lRrO8WbGoP0qxc',
  authDomain: 'famappy-6181c.firebaseapp.com',
  messagingSenderId: '998789579438',
  measurementId: 'G-N73T1JEWL7',
};

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private _app = initializeApp(firebaseConfig);
  get app() {
    return this._app;
  }

  private _auth = getAuth(this._app);

  get auth() {
    return this._auth;
  }

  private _db = getFirestore(this._app);
  get db() {
    return this._db;
  }
}
