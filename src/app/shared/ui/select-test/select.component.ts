import { Component, effect, HostBinding, input, output } from '@angular/core';

type SelectColor = 'primary' | 'secondary' | 'neutral';

@Component({
  selector: 'app-select-test',
  imports: [],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
})
export class SelectTestComponent<T = string> {
  label = input<string>();
  options = input.required<T[]>();
  value = input<T | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');
  responsive = input<boolean>(true);

  valueChange = output<T>();

  @HostBinding('class')
  get hostClasses() {
    // return this.responsive ? 'w-full md:w-fit block' : 'w-fit block';
    return this.responsive() ? 'w-full md:w-fit block' : 'block';
  }

  get classesLabel(): string {
    const classes = ['select-label', `select-label-${this.size}`];

    return classes.join(' ');
  }

  get classesSelect(): string {
    const classes = ['select', `select-${this.size}`];

    return classes.join(' ');
  }

  onChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.valueChange.emit(value as T);
  }
}
