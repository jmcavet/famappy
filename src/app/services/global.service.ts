import { Injectable, signal } from '@angular/core';
import { GlobalState } from '../models/global.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalStateService {
  initialState: GlobalState = {
    selectedTabTitle: '',
  };

  globalState = signal<GlobalState>(this.initialState);

  /**
   * Update a property from the global state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof GlobalState>(
    key: key,
    value: GlobalState[key],
  ) {
    this.globalState.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
