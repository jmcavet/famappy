import { Component, HostBinding, Input } from '@angular/core';

type ButtonVariant = 'outline' | 'surface' | 'ghost';
type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'neutral'
  | 'static';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'surface';
  @Input() color: ButtonColor = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;

  @HostBinding('class.w-full')
  get hostFullWidth() {
    return this.fullWidth;
  }

  get classes(): string {
    const classes = [
      'btn',
      `btn-${this.variant}-${this.color}`,
      `btn-${this.size}`,
      this.fullWidth ? 'w-full' : '',
      this.disabled ? 'btn-disabled' : '',
    ];

    return classes.join(' ');
  }
}
