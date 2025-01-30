import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { updateProfile } from 'firebase/auth';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    const rawForm = this.form.getRawValue();
    this.authService
      .signup(rawForm.email, rawForm.password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: rawForm.username });

        console.log('Signed up user: ', user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Error while signing up. Error code: ', errorCode);
        console.log('Error while signing up. Error message: ', errorMessage);
      });
    this.router.navigateByUrl('/');
  }
}
