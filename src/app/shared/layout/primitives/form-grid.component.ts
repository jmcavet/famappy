import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-form-grid',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'hostClasses()' },
  styles: [':host { display: grid; }'],
})
export class FormGridComponent {
  gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  align = input<'start' | 'center' | 'end'>('start');
  justifyItems = input<'start' | 'center' | 'end' | 'stretch'>('start');

  hostClasses = computed(() => {
    return [
      'grid grid-cols-[max-content_1fr]',
      `items-${this.align()}`,
      `space-${this.gap()}`,
      `justify-items-${this.justifyItems()}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
