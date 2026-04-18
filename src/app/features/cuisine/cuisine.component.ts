import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { CuisineFacade } from './cuisine.facade';

@Component({
  selector: 'app-cuisine',
  imports: [CapitalizePipe],
  providers: [CuisineFacade],
  templateUrl: './cuisine.component.html',
  styleUrl: './cuisine.component.css',
})
export class CuisineComponent {
  /** Services */
  private facade = inject(CuisineFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines = this.facade.dbCuisines;
  readonly cuisineId = this.facade.cuisineId;

  selectCuisine(cuisineId: string) {
    this.facade.selectCuisine(cuisineId);
  }

  openAddCuisineInputModal(event: MouseEvent) {
    this.facade.openAddCuisineInputModal(event);
  }
}
