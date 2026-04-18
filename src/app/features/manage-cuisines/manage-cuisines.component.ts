import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ManageCuisinesFacade } from './manage-cuisines.facade';

@Component({
  selector: 'app-manage-cuisines',
  imports: [CapitalizePipe, LoadingComponent],
  providers: [ManageCuisinesFacade],
  templateUrl: './manage-cuisines.component.html',
  styleUrl: './manage-cuisines.component.css',
})
export class ManageCuisinesComponent {
  private facade = inject(ManageCuisinesFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines = this.facade.dbCuisines;
  readonly canShowPage = this.facade.canShowPage;

  openAddCuisineInputModal(event: MouseEvent) {
    this.facade.openAddCuisineInputModal(event);
  }

  openUpdateCuisineInputModal(event: MouseEvent, cuisine: any) {
    this.facade.openUpdateCuisineInputModal(event, cuisine);
  }

  openDeleteModal(event: MouseEvent, cuisineId: string) {
    this.facade.openDeleteModal(event, cuisineId);
  }
}
