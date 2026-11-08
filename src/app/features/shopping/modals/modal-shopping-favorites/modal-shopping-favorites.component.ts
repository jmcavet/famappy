import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { ModalShoppingFavoritesFacade } from './modal-shopping-favorites.facade';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';
import { IngredientCategoryDocInBackend } from '../../../../models/ingredient.model';

@Component({
  selector: 'app-modal-shopping-favorites',
  imports: [
    ButtonComponent,
    RowComponent,
    StackComponent,
    InlineComponent,
    ChipComponent,
  ],
  providers: [ModalShoppingFavoritesFacade],
  templateUrl: './modal-shopping-favorites.component.html',
  styleUrl: './modal-shopping-favorites.component.css',
})
export class ModalShoppingFavoritesComponent {
  private readonly facade = inject(ModalShoppingFavoritesFacade);

  ingredientCategories = this.facade.ingredientCategories;
  ingredientsPerCategorySelected = this.facade.ingredientsPerCategorySelected;
  categoryIdsWithFavoriteIngredients =
    this.facade.categoryIdsWithFavoriteIngredients;
  categoryIdSelected = this.facade.categoryIdSelected;

  toggleSelection(category: IngredientCategoryDocInBackend) {
    this.facade.toggleSelection(category);
  }

  close() {
    this.facade.close();
  }

  validate() {
    this.facade.validate();
  }
}
