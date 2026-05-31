import { Component, computed } from '@angular/core';

@Component({
  selector: 'app-header-shell-shell',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
  },
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class HeaderShellComponent {
  hostClasses = computed(() => {
    return ['sticky top-0 z-10', 'surface-nav'].join(' ');
  });
}
