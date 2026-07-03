import { Injectable, signal } from '@angular/core';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { ShoppingState } from './shopping.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingStateService {
  initialState: ShoppingState = {
    shoppingListTitle: '',
    shoppingMealsSelected: [],
    ingredientCategoryIdSelected: '',
    measures: [],
    units: [],
  };

  state = signal<ShoppingState>(this.initialState);

  saveMealsForShoppingList(selectedMeals: any[]) {
    this.updateProperty('shoppingMealsSelected', selectedMeals);
  }

  setIngredientCategory(ingredientCategorySelected: any) {
    this.updateProperty(
      'ingredientCategoryIdSelected',
      ingredientCategorySelected.id,
    );
  }

  initialiseMeasures(measures: { id: string; measure: number }[]) {
    this.state.update((state) => ({
      ...state,
      measures,
    }));
  }

  changeMeasure(ingredientId: string, measure: number) {
    this.state.update((state) => {
      return {
        ...state,
        measures: [
          ...state.measures.filter((m) => m.id !== ingredientId),
          { id: ingredientId, measure },
        ],
      };
    });
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   */
  updateProperty<key extends keyof ShoppingState>(
    key: key,
    value: ShoppingState[key],
  ) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
