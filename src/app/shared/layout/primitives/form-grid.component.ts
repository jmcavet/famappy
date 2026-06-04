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
  responsive = input<boolean>(false);

  hostClasses = computed(() => {
    const gridCols = this.responsive()
      ? 'grid-cols-1 sm:grid-cols-[max-content_1fr]'
      : 'grid-cols-[max-content_1fr]';

    return [
      'grid',
      gridCols,
      `space-${this.gap()}`,
      `items-${this.align()}`,
      `justify-items-${this.justifyItems()}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
