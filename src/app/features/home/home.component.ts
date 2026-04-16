import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/backend/auth.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  /** Services */
  private authService = inject(AuthService);

  /** Declaration of local signals */
  readonly userName = this.authService.userName;

  user = signal<User | null>(null);

  ngOnInit(): void {
    const auth = getAuth(); // Get Firebase Auth instance

    // Listen for changes in the authentication state
    onAuthStateChanged(auth, (user) => {
      this.user.set(user ? user : null);
    });
  }
}
