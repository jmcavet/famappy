import { Component, inject, input, output, Signal } from '@angular/core';
import { IsAcending, SortKey } from '../../../../models/ingredient.model';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientType } from '../../../../models/ingredient-type.model';

@Component({
  selector: 'app-ingredient-filter',
  imports: [],
  templateUrl: './ingredient-filter.component.html',
  styleUrl: './ingredient-filter.component.css',
})
export class IngredientFilterComponent {
  /** Services */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  filterSelected = input<SortKey>();
  isAscending = input<IsAcending>();
  filterSelectedChange = output<SortKey>();

  /** Declaration of signals communicating with firestore */
  readonly ingredientCategorySelected: Signal<IngredientType | undefined> =
    this.ingredientCategoryService.ingredientCategorySelected;

  selectFilter(filter: SortKey) {
    this.filterSelectedChange.emit(filter);
  }
}
