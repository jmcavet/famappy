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
  @Input() badgeColor: ChipColor = 'neutral';
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

  get badgeClasses(): string {
    const colorClasses: Record<ChipColor, string> = {
      primary: 'bg-primary-500 dark:bg-primary-600',
      secondary: 'bg-secondary-500 dark:bg-secondary-600',
      neutral: 'bg-neutral-400 dark:bg-neutral-600',
    };

    return `absolute -top-2 -right-2 ${colorClasses[this.badgeColor]} text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center`;
  }
}
