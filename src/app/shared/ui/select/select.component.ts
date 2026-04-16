import { Component, HostBinding, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type SelectColor = 'primary' | 'secondary' | 'neutral';

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
})
export class SelectComponent<T = string> {
  @Input() label?: string;
  @Input({ required: true }) options: T[] = [];
  @Input({ required: true }) control!: FormControl;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() responsive = true;

  @HostBinding('class')
  get hostClasses() {
    return this.responsive ? 'w-full md:w-fit block' : 'w-fit block';
  }

  get classesLabel(): string {
    const classes = ['select-label', `select-label-${this.size}`];

    return classes.join(' ');
  }

  get classesSelect(): string {
    const classes = ['select', `select-${this.size}`];

    return classes.join(' ');
  }
}
