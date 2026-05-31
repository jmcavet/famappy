import { Component, input, output } from '@angular/core';
import {
  ButtonColor,
  ButtonComponent,
} from '../../../ui/button/button.component';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-floating-button',
  imports: [ButtonComponent, RouterLink, NgClass],
  templateUrl: './floating-button.component.html',
  styleUrl: './floating-button.component.css',
})
export class FloatingButtonComponent {
  color = input<ButtonColor>('primary');
  routerLink = input<string | any[]>();
  icon = input<string>('fa-plus');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}
