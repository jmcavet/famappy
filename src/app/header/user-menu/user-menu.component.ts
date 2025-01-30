import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  imports: [MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css',
})
export class UserMenuComponent {
  user = signal<User | null>(null);

  authService = inject(AuthService);
  router = inject(Router);

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

  logout() {
    console.log('About to log out of the system!');
    this.authService
      .logout()
      .then((info) => {
        this.router.navigateByUrl('/');
      })
      .catch((error) => {
        console.log('Could not log out: ', error.message);
      });
  }

  goToSettings() {
    this.router.navigateByUrl('/settings');
  }
}
