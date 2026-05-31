import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-row',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class RowComponent {
  justify = input<'start' | 'center' | 'end' | 'between'>('between');
  align = input<'start' | 'center' | 'end' | 'stretch'>('center');

  hostClasses = computed(() => {
    return [
      `flex flex-row`,
      `justify-${this.justify()}`,
      `items-${this.align()}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
