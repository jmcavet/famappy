import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { AuthService } from '../../services/backend/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  imports: [
    ButtonComponent,
    SegmentedControlComponent,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  router = inject(Router);

  authService = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly familyName = computed(
    () =>
      this.authService.user()?.familyName ||
      this.authService.user()?.displayName ||
      this.authService.userName() ||
      '',
  );
  readonly familyNameDraft = signal('');
  readonly editingFamilyName = signal(false);
  readonly savingFamilyName = signal(false);
  readonly mealRemindersEnabled = signal(true);
  readonly pushNotificationsEnabled = signal(true);

  startEditingFamilyName() {
    this.familyNameDraft.set(this.familyName());
    this.editingFamilyName.set(true);
  }

  cancelEditingFamilyName() {
    this.editingFamilyName.set(false);
    this.familyNameDraft.set(this.familyName());
  }

  async saveFamilyName() {
    const nextFamilyName = this.familyNameDraft().trim();

    if (!nextFamilyName) {
      return;
    }

    this.savingFamilyName.set(true);

    try {
      await this.authService.updateFamilyName(nextFamilyName);
      this.editingFamilyName.set(false);
    } catch (error) {
      console.error('Could not update family name:', error);
    } finally {
      this.savingFamilyName.set(false);
    }
  }

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
