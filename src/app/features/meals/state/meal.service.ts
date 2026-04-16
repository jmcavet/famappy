import { Injectable, signal } from '@angular/core';
import { MealState } from './mealCart.model';

@Injectable({
  providedIn: 'root',
})
export class MealStateService {
  initialState: MealState = {
    servings: 0,
    currentNavStep: 1,
  };

  state = signal<MealState>(this.initialState);

  updateProperty<key extends keyof MealState>(key: key, value: MealState[key]) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
