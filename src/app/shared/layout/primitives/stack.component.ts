import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-stack',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
  },
  styles: [':host { display: content; }'],
})
export class StackComponent {
  variant = input<
    'tight' | 'compact' | 'default' | 'section' | 'page' | 'spacious'
  >('default');
  align = input<'start' | 'center' | 'end' | 'stretch'>('stretch');

  hostClasses = computed(() => {
    const map = {
      tight: 'xs', // micro grouping (inline-like UI blocks)
      compact: 'sm', // tight UI grouping (forms, controls)
      default: 'md', // general purpose stacking (fallback)
      section: 'lg', // between elements INSIDE a section (cards, lists)
      page: 'xl', // between page sections (hero → categories → footer)
      spacious: '2xl', // exceptional separation (rare emphasis)
    };

    return [
      `flex flex-col`,
      `space-${map[this.variant()]}`,
      `items-${this.align()}`,
    ].join(' ');
  });
}
