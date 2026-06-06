import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { CuisineFacade } from './cuisine.facade';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-cuisine',
  imports: [
    CapitalizePipe,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    LoadingComponent,
  ],
  providers: [CuisineFacade],
  templateUrl: './cuisine.component.html',
  styleUrl: './cuisine.component.css',
})
export class CuisineComponent {
  /** Services */
  private facade = inject(CuisineFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines = this.facade.dbCuisines;
  readonly dbCuisinesSorted = this.facade.dbCuisinesSorted;
  readonly cuisineId = this.facade.cuisineId;
  readonly pageIsLoading = this.facade.pageIsLoading;

  selectCuisine(cuisineId: string) {
    this.facade.selectCuisine(cuisineId);
  }

  openAddCuisineInputModal(event: MouseEvent) {
    this.facade.openAddCuisineInputModal(event);
  }
}
