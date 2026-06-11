import { Component, HostBinding, input, output } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';
type ButtonShape = 'rounded' | 'pill';
type ButtonVariant = 'filled' | 'outline' | 'ghost';
export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'neutral'
  | 'lunch'
  | 'dinner';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  type = input<ButtonType>('button');
  shape = input<ButtonShape>('rounded');
  variant = input<ButtonVariant>('filled');
  color = input<ButtonColor>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  shadow = input<boolean>(false);

  clicked = output<MouseEvent>();

  @HostBinding('class.w-full')
  get hostFullWidth() {
    return this.fullWidth();
  }

  get classes(): string {
    const classes = [
      'btn',
      `btn--${this.shape()}`,
      `btn--${this.variant()}`,
      `btn--${this.color()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'w-full' : '',
      this.disabled() ? 'btn--disabled' : '',
      this.shadow() ? 'shadow-xl shadow-black/25 ring-1 ring-white/10' : '',
    ];

    return classes.join(' ');
  }

  onClick(event: MouseEvent) {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
