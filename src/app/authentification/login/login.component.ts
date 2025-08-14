import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../../services/backend/auth.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LoadingComponent],
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
