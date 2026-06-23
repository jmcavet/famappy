import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ManageCuisinesFacade } from './manage-cuisines.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-manage-cuisines',
  imports: [
    CapitalizePipe,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
  ],
  providers: [ManageCuisinesFacade],
  templateUrl: './manage-cuisines.component.html',
  styleUrl: './manage-cuisines.component.css',
})
export class ManageCuisinesComponent {
  private location = inject(Location);
  private facade = inject(ManageCuisinesFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisinesSorted = this.facade.dbCuisinesSorted;
  readonly pageIsLoading = this.facade.pageIsLoading;

  openAddCuisineInputModal(event: MouseEvent) {
    this.facade.openAddCuisineInputModal(event);
  }

  openUpdateCuisineInputModal(event: MouseEvent, cuisine: any) {
    this.facade.openUpdateCuisineInputModal(event, cuisine);
  }

  openDeleteModal(event: MouseEvent, cuisineId: string) {
    this.facade.openDeleteModal(event, cuisineId);
  }

  goBack() {
    this.location.back();
  }
}
