import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../../services/backend/auth.service';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LoadingComponent,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  auth = getAuth();

  /** Services */
  authService = inject(AuthService);

  /** State signals */
  formErrors = signal<string>('');

  readonly isLogingIn = this.authService.isLoggingIn;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    this.formErrors.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.authService
      .loginWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Logged in user: ', userCredential.user);
        this.router.navigateByUrl('/');
      })
      .catch((error) => {
        this.formErrors.set('Failed to log in. Try again.');
        console.error('Logging error:', error.code, error.message);
      })
      .finally(() => {
        this.form.controls.email.reset();
        this.form.controls.password.reset();
      });
  }
}
