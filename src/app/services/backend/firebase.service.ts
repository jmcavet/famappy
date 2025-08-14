import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../../environment';
import { getStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private _app = initializeApp(environment.firebaseConfig);
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

  private _storage = getStorage(this._app);
  get storage() {
    return this._storage;
  }
}
