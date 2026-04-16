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
  selector: 'app-toggle-btn-with-icon',
  imports: [],
  templateUrl: './toggle-btn-with-icon.component.html',
  styleUrl: './toggle-btn-with-icon.component.css',
})
export class ToggleBtnWithIconComponent<T extends string> {
  // Options to display
  options = input.required<T[]>();

  // initial selected value from parent
  selectedInput = input<number>(0);

  @Input() color: ButtonColor = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  // Currently selected option
  selected = signal<number>(0);

  // Emit selection changes
  selectionChange = output<number>();

  constructor() {
    effect(() => {
      const initial = this.selectedInput();
      this.selected.set(initial);
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

  select(position: number) {
    this.selected.set(position);
    this.selectionChange.emit(position);
  }
}
