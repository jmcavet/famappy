import { effect, Injectable, signal } from '@angular/core';

import { RecipeCategoryDocInBackend } from '../../models/cuisine.model';
import {
  Difficulty,
  Frequency,
  RecipeState,
  Season,
} from '../../models/recipe.model';
import { RecipeIngredient } from '../../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeStateService {
  initialRecipeState: RecipeState = {
    title: '',
    preparationTime: 0,
    cookingTime: 0,
    servings: 4,
    difficulty: 'normal',
    price: 'normal',
    frequency: 'monthly',
    seasonsSelected: [],
    difficultiesSelected: [],
    frequenciesSelected: [],
    cuisinesSelected: [],
    recipeCategoryIds: [],
    mealCategoryId: 'none',
    cuisineId: 'none',
    source: '',
    comment: '',
    ingredients: [],
    ingredient: 'none',
    ingredientId: 'none',
    selectedTabTitle: 'definition',
    instructions: [],
    filter: {
      mealCategories: [],
      cuisines: [],
      recipeCategories: [],
      ingredientCategories: [],
      ingredientIds: [],
      difficulties: [],
      prices: [],
      frequencies: [],
      seasons: [],
      ingredientFilterMode: 0,
    },
    nbFilters: 0,
    imageUrl: '',
    thumbnailUrl: '',
  };

  recipeState = signal<RecipeState>(this.initialRecipeState);

  formIsValid = signal<boolean>(false);

  /** Used to preserve Recipe state when navigating from the cuisine or meal category page (and saving a user
   * selection) back to the recipe page.
   */
  mustPreserveState = signal<boolean>(false);

  /** Signal to save the cuisine's name selected by user in cuisine page into recipe page internal state */
  cuisineName = signal<string>('none');

  imageFile = signal<File | null>(null);

  dateIsIncreasing = signal<boolean>(true);

  /**
   Resets the application state object to its initial value. It is used on the ngOnInit method
   of the TabDefinitionComponent so that when this page is loaded, the state is initialized. However,
   when going back from the CuisineComponent and the MealCategoryPage pages, the state is preserved.
   */
  resetRecipeState() {
    this.recipeState.set(this.initialRecipeState);
  }

  updateRecipeState(newState: RecipeState) {
    newState['selectedTabTitle'] = 'definition';
    this.recipeState.set(newState);
    this.preserveState(true);
  }

  setFormValidity(isValid: boolean): void {
    this.formIsValid.set(isValid);
  }

  setCuisineName(cuisineName: string) {
    this.cuisineName.set(cuisineName);
  }

  getCuisineNameSelected() {
    return this.cuisineName();
  }

  constructor() {
    console.log('RecipeStateService created');
  }

  update(updater: (state: RecipeState) => RecipeState) {
    console.log('Before update', this.recipeState());
    this.recipeState.update(updater);
    console.log('After update', this.recipeState());
  }

  /**
   * Adds an ingredient object to the recipe state based on the user selection.
   *
   * @param name - The name of the ingredient (e.g. 'apple')
   * @param measure - The measure of the ingredient (e.g. '30' in '30 Kg')
   * @param unit - The unit of the ingredient (e.g. '' for none,  'cl', 'l', etc.)
   */
  addIngredientToRecipe(name: string, measure: number, unit: string) {
    const newIngredient = {
      id: this.recipeState().ingredientId,
      name,
      measure,
      unit,
    };

    this.recipeState.update((state) => ({
      ...state,
      ingredients: [...(state.ingredients ?? []), newIngredient],
    }));
  }

  /**
   * Deletes an ingredient from the recipe state based on its index in the ingredients array.
   *
   * @param indexToRemove - The index of the ingredient to be removed.
   */
  deleteIngredient(indexToRemove: number) {
    this.recipeState.update((state) => ({
      ...state,
      ingredients:
        state.ingredients?.filter((_, index) => index !== indexToRemove) ?? [],
    }));
  }

  /**
   * Select an ingredient in the 'ingredients' page so that it becomes visible on the 'new-recipe' page
   *
   * @param ingredientId - The id of the ingredient.
   */
  selectIngredient(ingredientId: string) {
    this.recipeState.update((state) => ({
      ...state,
      ingredientId,
    }));
    this.preserveState(true);
  }

  /**
   * Adds an instruction to the recipe state based on the user selection.
   *
   * @param instructionName - The name of the instruction (e.g. 'Peel the vegetables.')
   */
  addInstructionToRecipe(instructionName: string) {
    this.recipeState.update((state) => ({
      ...state,
      instructions: [...(state.instructions ?? []), instructionName],
    }));
  }

  /**
   * Update an instruction from the recipe state based on its index and new instruction.
   *
   * @param indexToUpdate - The index of the instruction to be updated.
   */
  updateInstruction(indexToUpdate: number, newInstruction: string) {
    this.recipeState.update((state) => {
      const updatedInstructions = [...(state.instructions ?? [])];

      if (indexToUpdate >= 0 && indexToUpdate < updatedInstructions.length) {
        updatedInstructions[indexToUpdate] = newInstruction;
      }

      return {
        ...state,
        instructions: updatedInstructions,
      };
    });
  }

  /**
   * Deletes an instruction from the recipe state based on its index in the instructions array.
   *
   * @param indexToRemove - The index of the instruction to be removed.
   */
  deleteInstruction(indexToRemove: number) {
    this.recipeState.update((state) => ({
      ...state,
      instructions:
        state.instructions?.filter((_, index) => index !== indexToRemove) ?? [],
    }));
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof RecipeState>(
    key: key,
    value: RecipeState[key],
  ) {
    this.recipeState.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }

  increaseServings() {
    this.recipeState.update((state) => {
      return {
        ...state,
        servings: state.servings + 1,
      };
    });
  }

  decreaseServings() {
    if (this.recipeState().servings > 1) {
      this.recipeState.update((state) => {
        return {
          ...state,
          servings: state.servings - 1,
        };
      });
    }
  }

  setSeason(seasonSelected: Season) {
    let seasonsUpdated;

    if (this.recipeState().seasonsSelected.includes(seasonSelected)) {
      const index = this.recipeState().seasonsSelected.indexOf(seasonSelected);
      seasonsUpdated = this.recipeState().seasonsSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      seasonsUpdated = [...this.recipeState().seasonsSelected, seasonSelected];
    }
    this.updateProperty('seasonsSelected', seasonsUpdated);
  }

  setDifficulty(difficultySelected: Difficulty) {
    let difficultiesUpdated;

    if (this.recipeState().difficultiesSelected.includes(difficultySelected)) {
      const index =
        this.recipeState().difficultiesSelected.indexOf(difficultySelected);
      difficultiesUpdated = this.recipeState().difficultiesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      difficultiesUpdated = [
        ...this.recipeState().difficultiesSelected,
        difficultySelected,
      ];
    }
    this.updateProperty('difficultiesSelected', difficultiesUpdated);
  }

  setFrequency(frequencySelected: Frequency) {
    let frequenciesUpdated;

    if (this.recipeState().frequenciesSelected.includes(frequencySelected)) {
      const index =
        this.recipeState().frequenciesSelected.indexOf(frequencySelected);
      frequenciesUpdated = this.recipeState().frequenciesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      frequenciesUpdated = [
        ...this.recipeState().frequenciesSelected,
        frequencySelected,
      ];
    }
    this.updateProperty('frequenciesSelected', frequenciesUpdated);
  }

  setCuisine(cuisineSelected: any) {
    let cuisinesUpdated;

    if (this.recipeState().cuisinesSelected.includes(cuisineSelected)) {
      const index =
        this.recipeState().cuisinesSelected.indexOf(cuisineSelected);
      cuisinesUpdated = this.recipeState().cuisinesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      cuisinesUpdated = [
        ...this.recipeState().cuisinesSelected,
        cuisineSelected,
      ];
    }
    this.updateProperty('cuisinesSelected', cuisinesUpdated);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    let recipeCategoryIdsUpdated;

    if (
      this.recipeState().recipeCategoryIds.includes(recipeCategorySelected.id)
    ) {
      const index = this.recipeState().recipeCategoryIds.indexOf(
        recipeCategorySelected.id,
      );
      recipeCategoryIdsUpdated = this.recipeState().recipeCategoryIds.filter(
        (_, i) => i !== index,
      );
    } else {
      recipeCategoryIdsUpdated = [
        ...this.recipeState().recipeCategoryIds,
        recipeCategorySelected.id,
      ];
    }
    this.updateProperty('recipeCategoryIds', recipeCategoryIdsUpdated);
  }

  preserveState(condition: boolean) {
    this.mustPreserveState.set(condition);
  }

  /**
   * Save the filter defined by the user
   *
   * @param mealCategories - The meal categories filtered by the user's filter selection.
   * @param cuisines - The cuisines filtered by the user's filter selection.
   * @param recipeCategories - The recipe categories filtered by the user's filter selection.
   */
  saveFilter(
    mealCategories: string[],
    cuisines: string[],
    recipeCategories: string[],
    ingredientCategories: string[],
    ingredientIds: string[],
    difficulties: string[],
    prices: string[],
    frequencies: string[],
    seasons: string[],
    ingredientFilterMode: number,
  ) {
    this.recipeState.update((state) => ({
      ...state,
      filter: {
        mealCategories,
        cuisines,
        recipeCategories,
        ingredientCategories,
        ingredientIds,
        difficulties,
        prices,
        frequencies,
        seasons,
        ingredientFilterMode,
      },
    }));
    this.preserveState(true);
  }

  /**
   * Save the filter defined by the user
   *
   * @param numberFilter - The number of filters selected by the user. E.g. meal categories &
   * recipe categories -> 2.
   */
  saveNumberFilters(numberFilter: number) {
    this.recipeState.update((state) => ({
      ...state,
      nbFilters: numberFilter,
    }));
    this.preserveState(true);
  }

  saveFilterIngredientIds(ingredientIds: string[]) {
    this.recipeState.update((state) => ({
      ...state,
      filter: {
        ...state.filter,
        ingredientIds,
      },
    }));
  }

  resetFilterIngredientIds() {
    this.recipeState.update((state) => ({
      ...state,
      filter: {
        ...state.filter,
        ingredientIds: [],
      },
    }));
  }
}
