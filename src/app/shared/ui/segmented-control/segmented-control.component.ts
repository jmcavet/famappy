import {
  Component,
  effect,
  HostBinding,
  Input,
  input,
  output,
  signal,
} from '@angular/core';

type ButtonColor = 'primary' | 'secondary' | 'neutral';

@Component({
  selector: 'app-segmented-control',
  imports: [],
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.css',
})
export class SegmentedControlComponent<T extends string> {
  // Options to display
  options = input.required<T[]>();

  // initial selected value from parent
  selectedInput = input<T | null>(null);

  @Input() color: ButtonColor = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth = false;

  @HostBinding('class.w-full')
  get hostFullWidth() {
    return this.fullWidth;
  }

  // Currently selected option
  selected = signal<T | null>(null);

  // Emit selection changes
  selectionChange = output<T>();

  constructor() {
    effect(() => {
      const initial = this.selectedInput();
      if (initial !== null) {
        this.selected.set(initial);
      }
    });
  }

  get classes(): string {
    const classes = [
      'segmented-btn',
      `segmented-btn-${this.size}`,
      `segmented-btn-${this.color}`,
      'flex-1',
    ];

    return classes.join(' ');
  }

  select(option: T) {
    this.selected.set(option);
    this.selectionChange.emit(option);
  }
}
