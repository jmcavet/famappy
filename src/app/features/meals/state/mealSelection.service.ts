import { Injectable, signal } from '@angular/core';

import { MealSelectionState, SelectionViewMode } from './mealSelection.model';
import { MealCategoryDocInBackend } from '../../../models/cuisine.model';
import { IngredientCategoryDocInBackend } from '../../../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class MealSelectionStateService {
  initialState: MealSelectionState = {
    mealCategoryIdSelected: '',
    ingredientCategoriesSelected: [],
    ingredientsSelected: [],
    cart: [],
    ratio: 1,
    viewMode: 'Card',
  };

  state = signal<MealSelectionState>(this.initialState);

  setMealCategory(mealCategorySelected: MealCategoryDocInBackend) {
    this.updateProperty('mealCategoryIdSelected', mealCategorySelected.id);
  }

  setIngredientCategory(
    ingredientCategorySelected: IngredientCategoryDocInBackend,
  ) {
    let ingredientCategoriesUpdated;

    if (
      this.state().ingredientCategoriesSelected.includes(
        ingredientCategorySelected,
      )
    ) {
      const index = this.state().ingredientCategoriesSelected.indexOf(
        ingredientCategorySelected,
      );
      ingredientCategoriesUpdated =
        this.state().ingredientCategoriesSelected.filter((_, i) => i !== index);
    } else {
      ingredientCategoriesUpdated = [
        ...this.state().ingredientCategoriesSelected,
        ingredientCategorySelected,
      ];
    }

    console.log('ingredientCategoriesUpdated: ', ingredientCategoriesUpdated);
    this.updateProperty(
      'ingredientCategoriesSelected',
      ingredientCategoriesUpdated,
    );
  }

  updateRatio(type: string) {
    const currentValue = this.state().ratio;

    if (type === 'decrease') {
      if (this.state().ratio > 1) {
        this.updateProperty('ratio', currentValue - 1);
      }
    } else {
      if (this.state().ratio < 10) {
        this.updateProperty('ratio', currentValue + 1);
      }
    }
  }

  toggleView(viewType: SelectionViewMode) {
    this.updateProperty('viewMode', viewType);
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof MealSelectionState>(
    key: key,
    value: MealSelectionState[key],
  ) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
