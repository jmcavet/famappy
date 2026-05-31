import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-inline',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InlineComponent {
  gap = input<'none' | 'xs' | 'sm' | 'md' | 'lg'>('md');
  wrap = input<boolean>(false);

  hostClasses = computed(() => {
    return [
      `flex flex-row items-center`,
      `space-${this.gap()}`,
      this.wrap() ? `flex-wrap` : `flex-nowrap`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
