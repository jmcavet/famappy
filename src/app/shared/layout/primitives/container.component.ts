import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
  },
  styles: [
    `
      :host {
        display: block;
      }a
    `,
  ],
})
export class ContainerComponent {
  insetX = input<'none' | 'sm' | 'md' | 'lg'>('md');
  maxSize = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  hostClasses = computed(() => {
    return [`container-${this.maxSize()}`, `inset-x-${this.insetX()}`].join(
      ' ',
    );
  });
}
