import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { AuthService } from '../../services/backend/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  imports: [ButtonComponent, SegmentedControlComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  router = inject(Router);

  authService = inject(AuthService);
  readonly theme = inject(ThemeService);

  toggleTheme() {
    this.theme.toggle();
  }

  logout() {
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
