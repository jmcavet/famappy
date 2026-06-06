import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-grid-responsive',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'hostClasses()' },
  styles: [':host { display: grid; }'],
})
export class GridResponsiveComponent {
  template = input<'equal' | 'auto-fill'>('equal');
  cols = input<1 | 2 | 3 | 4>(2);
  colsMd = input<1 | 2 | 3 | 4 | null>(null);
  colsLg = input<1 | 2 | 3 | 4 | null>(null);
  gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  align = input<'start' | 'center' | 'end' | 'stretch'>('stretch');
  justify = input<'start' | 'center' | 'end' | 'stretch'>('stretch');

  private readonly colsMdMap: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  private readonly colsLgMap: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  hostClasses = computed(() => {
    const md = this.colsMd();
    const lg = this.colsLg();

    return [
      'grid',
      this.template() === 'auto-fill'
        ? // ? '[grid-template-columns:auto_1fr]'
          // `[grid-template-columns: minmax(40px, max-content) 1fr]`
          `[grid-template-columns: minmax(40px, 80px) 1fr]`
        : `grid-cols-${this.cols()}`,
      md ? this.colsMdMap[md] : null,
      lg ? this.colsLgMap[lg] : null,
      `space-${this.gap()}`,
      `items-${this.align()}`,
      `justify-items-${this.justify()}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
