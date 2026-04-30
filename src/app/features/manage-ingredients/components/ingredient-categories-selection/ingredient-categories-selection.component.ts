import { Component, computed, inject, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import {
  IngredientType,
  IngredientTypeWithDate,
} from '../../../../models/ingredient-type.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [ButtonComponent, ChipComponent, RouterLink],
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
  ingredientCategorySelected = signal<IngredientType | undefined>(undefined);

  linkText = computed(() => {
    const ingredientCategoriesNew = this.ingredientCategories().map((item) => ({
      name: item.name,
      id: item.id,
    }));
    const linkText =
      ingredientCategoriesNew.length === 0
        ? 'Start by adding a new category'
        : '';
    return linkText;
  });

  selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean,
  ) {
    this.ingredientCategorySelected.set(
      atLeastOneUnitSelected ? undefined : ingredientTypeElement,
    );

    this.ingredientCategoryService.setSelectedIngredientCategory(
      this.ingredientCategorySelected(),
    );
  }
}
