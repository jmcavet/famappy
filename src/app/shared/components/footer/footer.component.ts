import { Component, inject, signal } from '@angular/core';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BottomNavigationComponent } from '../bottomNavigation/bottom-navigation.component';
import { FirebaseService } from '../../../services/backend/firebase.service';

@Component({
  selector: 'app-footer',
  imports: [BottomNavigationComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  private firebase = inject(FirebaseService);
  user = signal<User | null>(null);

  // ngOnInit(): void {
  //   const auth = getAuth(); // Get Firebase Auth instance
  //   // Listen for changes in the authentication state
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       this.user.set(user);
  //     } else {
  //       this.user.set(null);
  //     }
  //   });

  //   console.log('uSeR: ', this.user());
  // }
  ngOnInit(): void {
    const auth = this.firebase.auth;

    this.unsubscribe = onAuthStateChanged(auth, (user) => {
      this.user.set(user ?? null);
    });
  }

  private unsubscribe?: () => void;

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
