import { Component, signal } from '@angular/core';
import { BottomNavigationComponent } from './bottomNavigation/bottom-navigation.component';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-footer',
  imports: [BottomNavigationComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  user = signal<User | null>(null);

  ngOnInit(): void {
    const auth = getAuth(); // Get Firebase Auth instance

    // Listen for changes in the authentication state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user.set(user);
      } else {
        this.user.set(null);
      }
    });
  }
}
