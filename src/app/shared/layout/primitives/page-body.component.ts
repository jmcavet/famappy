import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-page-body',
  standalone: true,
  template: `<main [class]="hostClasses()"><ng-content /></main>`,
  styles: [':host { display: contents; }'],
})
export class PageBodyComponent {
  insetY = input<'none' | 'sm' | 'md' | 'lg'>('md');

  hostClasses = computed(() =>
    [`flex-1 min-h-0 overflow-y-auto`, `inset-y-${this.insetY()}`].join(' '),
  );
}
