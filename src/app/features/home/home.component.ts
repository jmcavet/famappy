import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/backend/auth.service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  /** Services */
  private authService = inject(AuthService);

  /** Declaration of local signals */
  readonly userName = this.authService.userName;
}
