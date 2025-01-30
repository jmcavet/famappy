import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../theme.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  imports: [
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatMenuModule,
    UserMenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  user = signal<User | null>(null);

  isLoggedIn: boolean = false;
  isDarkMode: boolean;

  authService = inject(AuthService);
  router = inject(Router);

  constructor(private themeService: ThemeService) {
    this.isDarkMode = this.themeService.isDarkMode();
  }

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

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.setDarkMode(this.isDarkMode);
  }

  login() {
    console.log('LOGGEDIN: ', this.isLoggedIn);
    this.isLoggedIn = true;
  }

  logout() {
    console.log('About to log out of the system!');
    this.authService
      .logout()
      .then((info) => {
        this.router.navigateByUrl('/login');
      })
      .catch((error) => {
        console.log('Could not log out: ', error.message);
      });
  }
}
