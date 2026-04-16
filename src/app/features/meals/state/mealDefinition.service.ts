import { Injectable, signal } from '@angular/core';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { MealDefinitionState } from './mealDefinition.model';

@Injectable({
  providedIn: 'root',
})
export class MealDefinitionStateService {
  initialState: MealDefinitionState = {
    plannedMealsCount: 1,
    mealCategoriesSelected: [],
  };

  state = signal<MealDefinitionState>(this.initialState);

  savePlannedMealsCount(plannedMealsCount: number) {
    this.updateProperty('plannedMealsCount', plannedMealsCount);
  }

  saveMealCategories(selectedCategories: RecipeCategoryDocInBackend[]) {
    this.updateProperty('mealCategoriesSelected', selectedCategories);
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof MealDefinitionState>(
    key: key,
    value: MealDefinitionState[key]
  ) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
