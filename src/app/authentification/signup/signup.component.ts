import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/backend/auth.service';
import { FirebaseService } from '../../services/backend/firebase.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, LoadingComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  fb = inject(FormBuilder);
  router = inject(Router);

  /** Services */
  authService = inject(AuthService);
  firebaseService = inject(FirebaseService);

  /** State signals */
  formErrors = signal<string>('');

  readonly isSigningUp = this.authService.isSigningUp;

  form = this.fb.nonNullable.group({
    familyName: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    const { email, password, familyName } = this.form.getRawValue();

    this.authService
      .signupWithProfileAndMetadata(email, password, familyName)
      .then((userCredential) => {
        console.log('Signed up user: ', userCredential.user);
        this.router.navigateByUrl('/');
      })
      .catch((error) => {
        this.formErrors.set('Failed to sign up. Try again.');
        console.error('Signup error:', error.code, error.message);
      });
  }
}
