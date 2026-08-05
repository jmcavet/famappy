import { Component, EventEmitter, Input, Output } from '@angular/core';

type ChipVariant = 'outline' | 'surface' | 'ghost';
type ChipColor = 'primary' | 'secondary' | 'neutral';

@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.css',
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'surface';
  @Input() color: ChipColor = 'primary';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth: false | true = false;
  @Input() selected: false | true = false;
  @Input() badgeCount: number = 0;
  @Input() disabled: false | true = false;
  @Input() interactive: false | true = true;

  @Output() toggle = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.toggle.emit();
    }
  }

  get classes(): string {
    const classes = [
      'relative',
      'chip',
      `chip-${this.size}`,
      this.fullWidth ? 'w-full' : '',
    ];

    if (this.disabled) {
      classes.push('chip-disabled');
    } else {
      classes.push(this.interactive ? 'chip-interactive' : '');
    }

    if (this.selected) {
      classes.push(`chip-selected-${this.color}`);
    } else {
      classes.push(`chip-${this.variant}`);
    }

    return classes.join(' ');
  }
}
