import {
  Component,
  inject,
  input,
  output,
  signal,
  Signal,
} from '@angular/core';
import { IsAcending, SortKey } from '../../../../models/ingredient.model';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientType } from '../../../../models/ingredient-type.model';
import { SegmentedControlComponent } from '../../../../shared/ui/segmented-control/segmented-control.component';

@Component({
  selector: 'app-ingredient-filter',
  imports: [SegmentedControlComponent],
  templateUrl: './ingredient-filter.component.html',
  styleUrl: './ingredient-filter.component.css',
})
export class IngredientFilterComponent {
  /** Services */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  filterSelected = input<SortKey>();
  isAscending = input<IsAcending>();
  filterSelectedChange = output<SortKey>();

  options: SortKey[] = ['dateCreated', 'category', 'name'];
  optionSelected = signal<SortKey>(this.options[0]);

  /** Declaration of signals communicating with firestore */
  readonly ingredientCategorySelected: Signal<IngredientType | undefined> =
    this.ingredientCategoryService.ingredientCategorySelected;

  selectFilter(event: SortKey) {
    this.filterSelectedChange.emit(event);
    this.optionSelected.set(event);
  }
}
