import { Component, inject, input, Signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { ModalShoppingFavoritesFacade } from './modal-shopping-favorites.facade';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../../../models/ingredient.model';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { MeasureControlComponent } from '../../components/measure-control/measure-control.component';
import { ShoppingListIngredient } from '../../../../models/shopping-list.model';

export interface ModalShoppingFavoritesContext {
  shoppingListIngredients: Signal<ShoppingListIngredient[]>;
}

@Component({
  selector: 'app-modal-shopping-favorites',
  imports: [
    ButtonComponent,
    RowComponent,
    StackComponent,
    SectionComponent,
    InlineComponent,
    ChipComponent,
    MeasureControlComponent,
  ],
  providers: [ModalShoppingFavoritesFacade],
  templateUrl: './modal-shopping-favorites.component.html',
  styleUrl: './modal-shopping-favorites.component.css',
})
export class ModalShoppingFavoritesComponent {
  private readonly facade = inject(ModalShoppingFavoritesFacade);

  shoppingListIngredients = input<ShoppingListIngredient[]>([]);

  ngOnInit() {
    this.facade.connect({
      shoppingListIngredients: this.shoppingListIngredients,
    });
  }

  ingredientCategories = this.facade.ingredientCategories;
  ingredientsPerCategorySelected = this.facade.ingredientsPerCategorySelected;
  categoryIdsWithFavoriteIngredients =
    this.facade.categoryIdsWithFavoriteIngredients;

  categoryIdSelected = this.facade.categoryIdSelected;
  selectedFavoriteIngredients = this.facade.selectedFavoriteIngredients;
  selectedFavoriteIngredientsCount =
    this.facade.selectedFavoriteIngredientsCount;

  toggleSelection(category: IngredientCategoryDocInBackend) {
    this.facade.toggleSelection(category);
  }

  selectIngredient(ingredientId: string) {
    this.facade.selectIngredient(ingredientId);
  }

  selectedIngredientCountForCategory(categoryId: string) {
    return this.facade.selectedIngredientCountForCategory(categoryId);
  }

  isIngredientAlreadyInShoppingList(ingredientId: string) {
    return this.facade.isIngredientAlreadyInShoppingList(ingredientId);
  }

  measureFor(ingredient: IngredientDocInBackend) {
    return this.facade.measureFor(ingredient);
  }

  changeIngredientMeasure(
    ingredient: IngredientDocInBackend,
    direction: 'decr' | 'incr',
  ) {
    this.facade.changeIngredientMeasure(ingredient, direction);
  }

  close() {
    this.facade.close();
  }

  validate() {
    this.facade.validate();
  }
}
