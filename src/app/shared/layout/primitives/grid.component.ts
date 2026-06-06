import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-grid',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClasses()',
    '[style.grid-template-columns]': 'gridTemplateColumns()',
  },
  styles: [':host { display: grid; }'],
})
export class GridComponent {
  gapX = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  gapY = input<'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  align = input<'start' | 'center' | 'end' | 'stretch'>('center'); // Cells centered vertically
  justify = input<'start' | 'center' | 'end' | 'stretch'>('start'); // Cells at the left (start) horizontally

  col1 = input<'max' | '1'>('1');
  col2 = input<'max' | '1'>('1');
  col3 = input<'max' | '1' | null>(null);

  private readonly trackMap = {
    max: 'max-content',
    1: '1fr',
  };

  gridTemplateColumns = computed(() => {
    const cols = [this.trackMap[this.col1()], this.trackMap[this.col2()]];

    if (this.col3()) {
      cols.push(this.trackMap[this.col3()!]);
    }

    return cols.join(' ');
  });

  hostClasses = computed(() => {
    return [
      'grid',
      `gap-x-${this.gapX()}`,
      `gap-y-${this.gapY()}`,
      `items-${this.align()}`,
      `justify-items-${this.justify()}`,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
