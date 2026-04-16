import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: false | true = false;
  @Input() btnStyle: 'filled' | 'outlined' | 'text-based' = 'filled';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() icon: string = '';
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() disabled: boolean = false;

  getClasses() {
    return [
      'btn',
      `btn-${this.fullWidth}`,
      `btn-${this.size}`,
      `btn-${this.color}`,
      `btn-${this.btnStyle}`,
      this.disabled ? 'disabled' : '',
    ];
  }

  getIconClasses() {
    return [`parent-${this.size}`, `icon-${this.iconPos}`, `${this.icon}`];
  }

  // Output event to notify parent on button click
  @Output() click: EventEmitter<void> = new EventEmitter<void>();

  // Method to emit click event
  onClick(): void {
    if (!this.disabled) {
      this.click.emit(); // Emit event when clicked
    }
  }
}
