import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<div [class]="hostClasses()">
    <ng-content />
  </div>`,
})
export class CardComponent {
  surface = input<'0' | '1' | '2' | '3'>('1');
  inset = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  interactive = input<boolean>(false);
  activated = input<boolean>(false);

  hostClasses = computed(() => {
    return [
      'card',
      `surface-${this.surface()}`,
      this.interactive() ? 'surface-interactive' : '',
      this.activated()
        ? 'bg-primary-50 border border-primary-500 dark:bg-primary-950/30 dark:border-primary-400'
        : '',
      `inset-${this.inset()}`,
    ].join(' ');
  });
}
