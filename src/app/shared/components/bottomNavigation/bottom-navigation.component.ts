import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-bottom-navigation',
  imports: [
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    ButtonComponent,
  ],
  templateUrl: './bottom-navigation.component.html',
  styleUrl: './bottom-navigation.component.css',
})
export class BottomNavigationComponent {}
