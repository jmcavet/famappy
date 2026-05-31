import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-section',
  standalone: true,
  template: `
    <section [class]="hostClasses()">
      @if (title()) {
        <h2 class="section-title">{{ title() }}</h2>
      }
      <ng-content />
    </section>
  `,
  styles: [':host { display: contents; }'],
})
export class SectionComponent {
  title = input<string>();
  surface = input<0 | 1 | 2 | 3>(1);
  inset = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  shadow = input<false | true>(true);

  hostClasses = computed(() => {
    return [
      'rounded-xl',
      `surface-${this.surface()}`,
      `inset-${this.inset()}`,
      `shadow-${this.shadow() ? 'lg' : 'none'}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
