import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-form-grid',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'hostClasses()' },
  styles: [':host { display: grid; }'],
})
export class FormGridComponent {
  maxContent = input<'max-content_1fr' | '1fr_max-content'>('max-content_1fr');
  gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  align = input<'start' | 'center' | 'end'>('start');
  justifyItems = input<'start' | 'center' | 'end' | 'stretch'>('start');
  responsive = input<boolean>(false);

  private readonly colsMap = {
    'max-content_1fr': 'grid-cols-[max-content_1fr]',
    '1fr_max-content': 'grid-cols-[1fr_max-content]',
  };

  private readonly colsMapResponsive = {
    'max-content_1fr': 'sm:grid-cols-[max-content_1fr]',
    '1fr_max-content': 'sm:grid-cols-[1fr_max-content]',
  };

  hostClasses = computed(() => {
    const gridCols = this.responsive()
      ? `grid-cols-1 ${this.colsMapResponsive[this.maxContent()]}`
      : this.colsMap[this.maxContent()];

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
