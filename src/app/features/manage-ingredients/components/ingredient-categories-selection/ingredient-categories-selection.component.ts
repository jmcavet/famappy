import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IngredientType } from '../../../../models/ingredient-type.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';
import { IngredientCategoriesSelectionFacade } from './ingredient-categories-selection.facade';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [
    ButtonComponent,
    ChipComponent,
    RouterLink,
    StackComponent,
    InlineComponent,
  ],
  providers: [IngredientCategoriesSelectionFacade],
  templateUrl: './ingredient-categories-selection.component.html',
  styleUrl: './ingredient-categories-selection.component.css',
})
export class IngredientCategoriesSelectionComponent {
  private facade = inject(IngredientCategoriesSelectionFacade);

  readonly ingredientCategoriesSorted = this.facade.ingredientCategoriesSorted;
  readonly ingredientCategorySelected = this.facade.ingredientCategorySelected;

  selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean,
  ) {
    this.facade.selectIngredientType(
      ingredientTypeElement,
      atLeastOneUnitSelected,
    );
  }

  openAddModal(event: MouseEvent) {
    this.facade.openAddModal(event);
  }
}
