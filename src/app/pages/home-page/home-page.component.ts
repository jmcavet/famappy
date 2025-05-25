import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [ButtonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {}
