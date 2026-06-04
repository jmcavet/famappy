import { Component } from '@angular/core';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { FormGridComponent } from '../../shared/layout/primitives/form-grid.component';

@Component({
  selector: 'app-layout',
  imports: [
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    FormGridComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {}
