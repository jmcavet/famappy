import { Component, input } from '@angular/core';
import { PageBodyComponent } from './page-body.component';
import { ContainerComponent } from './container.component';
import { StackComponent } from './stack.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  template: `<app-page-body [insetY]="insetY()">
    <app-container [maxSize]="maxSize()">
      <app-stack variant="page">
        <ng-content />
      </app-stack>
    </app-container>
  </app-page-body>`,
  imports: [PageBodyComponent, ContainerComponent, StackComponent],
  styles: [
    `
      :host {
        display: contents;
      }a
    `,
  ],
})
export class PageLayoutComponent {
  insetY = input<'none' | 'sm' | 'md' | 'lg'>('md');
  maxSize = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
}
