import { Component, input } from '@angular/core';

type TagVariant = 'filled' | 'outline' | 'ghost';
export type TagColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'neutral'
  | 'scaleLow'
  | 'scaleMedium'
  | 'scaleHigh';
type TagSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-tag',
  imports: [],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
})
export class TagComponent {
  variant = input<TagVariant>('filled');
  color = input<TagColor>('primary');
  size = input<TagSize>('md');

  get classes(): string {
    const classes = [
      'tag',
      `tag--${this.variant()}`,
      `tag--${this.color()}`,
      `tag--${this.size()}`,
    ];

    return classes.join(' ');
  }
}
