import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { AuthService } from '../../../services/backend/auth.service';
import { HeaderService } from '../../../services/header.service';

@Component({
  selector: 'app-header',
  imports: [
    ButtonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  router = inject(Router);
  private location = inject(Location);

  /** Services */
  authService = inject(AuthService);
  private headerService = inject(HeaderService);

  /** Local and state signals */
  user = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);
  dropdownOpen = signal<boolean>(false);
  headerConfig = this.headerService.headerConfig;

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  // ngOnInit(): void {
  //   const auth = getAuth(); // Get Firebase Auth instance

  //   // Listen for changes in the authentication state
  //   onAuthStateChanged(auth, (user) => {
  //     this.user.set(user ? user : null);
  //   });
  // }

  // login() {
  //   this.isLoggedIn.set(true);
  // }

  // logout() {
  //   this.authService
  //     .logout()
  //     .then((info) => {
  //       this.router.navigateByUrl('/login');
  //     })
  //     .catch((error) => {
  //       console.log('Could not log out: ', error.message);
  //     });
  // }

  // goBack() {
  //   this.location.back();
  // }

  // toggleDropdown(event: MouseEvent) {
  //   event.stopPropagation(); // prevent immediate closing when clicking the icon
  //   this.dropdownOpen.set(!this.dropdownOpen());
  // }

  // onSelectOption(option: { label: string; icon: string; url: string }) {
  //   this.dropdownOpen.set(false);
  //   this.router.navigate([option.url]);
  // }

  // @HostListener('document:click', ['$event'])
  // handleOutsideClick(event: MouseEvent) {
  //   if (
  //     this.dropdownContainer &&
  //     !this.dropdownContainer.nativeElement.contains(event.target)
  //   ) {
  //     this.dropdownOpen.set(false);
  //   }
  // }
}
