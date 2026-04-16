import { Component, computed, inject, signal, Signal } from '@angular/core';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientTypeWithDate } from '../../../../models/ingredient-type.model';
import { SegmentedControlComponent } from '../../../../shared/ui/segmented-control/segmented-control.component';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [SegmentedControlComponent],
  templateUrl: './ingredient-categories-selection.component.html',
  styleUrl: './ingredient-categories-selection.component.css',
})
export class IngredientCategoriesSelectionComponent {
  /** Services */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly ingredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;

  /** Declaration of local signals */
  ingredientCatNameSelected = signal<string | undefined>(undefined);

  ingredientCategoriesNames = computed(() =>
    this.ingredientCategories().map((cat) => cat.name),
  );

  toggleCategory(categoryName: string) {
    const alreadySelected = categoryName === this.ingredientCatNameSelected();

    this.ingredientCatNameSelected.update(() =>
      alreadySelected ? '' : categoryName,
    );

    const categorySelected = this.ingredientCategories().find(
      (cat) => cat.name === categoryName,
    );

    this.ingredientCategoryService.setSelectedIngredientCategory(
      alreadySelected ? undefined : categorySelected,
    );
  }
}
