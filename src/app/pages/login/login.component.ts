import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { getAuth, updateProfile } from 'firebase/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  errorSignal = signal<string>('');

  fb = inject(FormBuilder);
  auth = getAuth();
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    const rawForm = this.form.getRawValue();
    this.authService
      .login(rawForm.email, rawForm.password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('userCredential: ', userCredential);
        console.log('USER: ', user);
        if (user.displayName) {
          this.authService.updateName(user.displayName);
        }

        console.log('LOGGED IN SIGNAL: ', this.authService.user);
        this.router.navigateByUrl('/');
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log('errorCode: ', errorCode);
        const errorMessage = error.message;
        this.errorSignal.set(errorMessage);

        this.form.controls.email.reset();
        this.form.controls.password.reset();
      });
  }
}
