import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../theme.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { HeaderConfig, HeaderService } from '../../services/header.service';

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
  config!: HeaderConfig;

  user = signal<User | null>(null);

  isLoggedIn: boolean = false;
  isDarkMode: boolean;
  title = '';
  dropdownOpen = false;

  authService = inject(AuthService);
  router = inject(Router);
  headerService = inject(HeaderService);
  private location = inject(Location);

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

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

    // Whenever a new component is being loaded, the title for the header will be sent
    this.headerService.headerConfig$.subscribe((config) => {
      this.config = config;
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

  goBack() {
    this.location.back();
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // prevent immediate closing when clicking the icon
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSelectOption(option: { label: string; icon: string; url: string }) {
    this.dropdownOpen = false;
    this.router.navigate([option.url]);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (
      this.dropdownContainer &&
      !this.dropdownContainer.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }
}
