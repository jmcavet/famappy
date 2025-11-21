import { Injectable, signal } from '@angular/core';

import { Difficulty, Frequency, Season } from '../../models/recipe.model';
import { MealState } from '../../models/meal.model';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../models/cuisine.model';
import { RecipeWithId } from '../../features/recipes/components/recipe-card/recipe.model';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
  RecipeIngredient,
} from '../../models/ingredient.model';

@Injectable({
  providedIn: 'root',
})
export class MealStateService {
  initialMealState: MealState = {
    nbPlannedMeals: 1,
    mealCategoriesSelected: [],
    mealCategoryIds: [],
    mealCategoryIdSelected: '',
    cuisinesSelected: [],
    seasonsSelected: [],
    difficultiesSelected: [],
    frequenciesSelected: [],
    recipeCategoryIds: [],
    recipesFiltered: [],
    ingredientCategoriesSelected: [],
    ingredientsSelected: [],
    cart: [],
    ratio: 1,
    recipesDisplayedViaCards: true,
  };

  mealState = signal<MealState>(this.initialMealState);

  saveNbPlannedMeals(nbPlannedMeals: number) {
    this.mealState().nbPlannedMeals = nbPlannedMeals;
  }

  saveMealCategories(selectedCategories: RecipeCategoryDocInBackend[]) {
    this.mealState().mealCategoriesSelected = selectedCategories;
  }

  /**
   Resets the application state object to its initial value
   */
  resetMealState() {
    this.mealState.set(this.initialMealState);
  }

  constructor() {
    console.log('MealStateService created');
  }

  setCuisine(cuisineSelected: CuisineDocInBackend) {
    let cuisinesUpdated;

    if (this.mealState().cuisinesSelected.includes(cuisineSelected)) {
      const index = this.mealState().cuisinesSelected.indexOf(cuisineSelected);
      cuisinesUpdated = this.mealState().cuisinesSelected.filter(
        (_, i) => i !== index
      );
    } else {
      cuisinesUpdated = [...this.mealState().cuisinesSelected, cuisineSelected];
    }

    this.updateProperty('cuisinesSelected', cuisinesUpdated);
  }

  setSeason(seasonSelected: Season) {
    let seasonsUpdated;

    if (this.mealState().seasonsSelected.includes(seasonSelected)) {
      const index = this.mealState().seasonsSelected.indexOf(seasonSelected);
      seasonsUpdated = this.mealState().seasonsSelected.filter(
        (_, i) => i !== index
      );
    } else {
      seasonsUpdated = [...this.mealState().seasonsSelected, seasonSelected];
    }

    this.updateProperty('seasonsSelected', seasonsUpdated);
  }

  setDifficulty(difficultySelected: Difficulty) {
    let difficultiesUpdated;

    if (this.mealState().difficultiesSelected.includes(difficultySelected)) {
      const index =
        this.mealState().difficultiesSelected.indexOf(difficultySelected);
      difficultiesUpdated = this.mealState().difficultiesSelected.filter(
        (_, i) => i !== index
      );
    } else {
      difficultiesUpdated = [
        ...this.mealState().difficultiesSelected,
        difficultySelected,
      ];
    }

    this.updateProperty('difficultiesSelected', difficultiesUpdated);
  }

  setFrequency(frequencySelected: Frequency) {
    let frequenciesUpdated;

    if (this.mealState().frequenciesSelected.includes(frequencySelected)) {
      const index =
        this.mealState().frequenciesSelected.indexOf(frequencySelected);
      frequenciesUpdated = this.mealState().frequenciesSelected.filter(
        (_, i) => i !== index
      );
    } else {
      frequenciesUpdated = [
        ...this.mealState().frequenciesSelected,
        frequencySelected,
      ];
    }
    this.updateProperty('frequenciesSelected', frequenciesUpdated);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    let recipeCategoryIdsUpdated;

    if (
      this.mealState().recipeCategoryIds.includes(recipeCategorySelected.id)
    ) {
      const index = this.mealState().recipeCategoryIds.indexOf(
        recipeCategorySelected.id
      );
      recipeCategoryIdsUpdated = this.mealState().recipeCategoryIds.filter(
        (_, i) => i !== index
      );
    } else {
      recipeCategoryIdsUpdated = [
        ...this.mealState().recipeCategoryIds,
        recipeCategorySelected.id,
      ];
    }
    this.updateProperty('recipeCategoryIds', recipeCategoryIdsUpdated);
  }

  setIngredientCategory(
    ingredientCategorySelected: IngredientCategoryDocInBackend
  ) {
    let ingredientCategoriesUpdated;

    if (
      this.mealState().ingredientCategoriesSelected.includes(
        ingredientCategorySelected
      )
    ) {
      const index = this.mealState().ingredientCategoriesSelected.indexOf(
        ingredientCategorySelected
      );
      ingredientCategoriesUpdated =
        this.mealState().ingredientCategoriesSelected.filter(
          (_, i) => i !== index
        );
    } else {
      ingredientCategoriesUpdated = [
        ...this.mealState().ingredientCategoriesSelected,
        ingredientCategorySelected,
      ];
    }

    this.updateProperty(
      'ingredientCategoriesSelected',
      ingredientCategoriesUpdated
    );
  }

  setIngredient(ingredientSelected: RecipeIngredient) {
    let ingredientsUpdated;

    if (this.mealState().ingredientsSelected.includes(ingredientSelected)) {
      const index =
        this.mealState().ingredientsSelected.indexOf(ingredientSelected);
      ingredientsUpdated = this.mealState().ingredientsSelected.filter(
        (_, i) => i !== index
      );
    } else {
      ingredientsUpdated = [
        ...this.mealState().ingredientsSelected,
        ingredientSelected,
      ];
    }

    this.updateProperty('ingredientsSelected', ingredientsUpdated);
  }

  filterRecipes(recipes: RecipeWithId[]) {
    this.updateProperty('recipesFiltered', recipes);
  }

  filterRecipesTest(dbRecipes: RecipeWithId[]) {
    const recipesUpdatedByCuisine =
      this.mealState().cuisinesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.mealState()
              .cuisinesSelected.map((el) => el.id)
              .includes(recipe.cuisineId)
          )
        : dbRecipes;

    const recipesUpdatedBySeason =
      this.mealState().seasonsSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.mealState().seasonsSelected.some((item) =>
              recipe.seasonsSelected.includes(item)
            )
          )
        : dbRecipes;

    const recipesUpdatedByFrequency =
      this.mealState().frequenciesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.mealState().frequenciesSelected.includes(recipe.frequency)
          )
        : dbRecipes;

    const recipesUpdatedByDifficulty =
      this.mealState().difficultiesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.mealState().difficultiesSelected.includes(recipe.difficulty)
          )
        : dbRecipes;

    const recipesUpdatedByRecipeCategory =
      this.mealState().recipeCategoryIds.length > 0
        ? dbRecipes.filter((recipe) =>
            this.mealState().recipeCategoryIds.some((item) =>
              recipe.recipeCategoryIds.includes(item)
            )
          )
        : dbRecipes;

    const ids2 = new Set(recipesUpdatedBySeason.map((o) => o.id));
    const ids3 = new Set(recipesUpdatedByFrequency.map((o) => o.id));
    const ids4 = new Set(recipesUpdatedByDifficulty.map((o) => o.id));
    const ids5 = new Set(recipesUpdatedByRecipeCategory.map((o) => o.id));

    const recipes = recipesUpdatedByCuisine.filter(
      (o) =>
        ids2.has(o.id) && ids3.has(o.id) && ids4.has(o.id) && ids5.has(o.id)
    );

    this.filterRecipes(recipes);
  }

  setMealCategory(mealCategorySelected: MealCategoryDocInBackend) {
    this.updateProperty('mealCategoryIdSelected', mealCategorySelected.id);
  }

  addRecipesToCart(recipes: RecipeWithId[]) {
    const currentCart = this.mealState().cart;
    this.updateProperty('cart', [...currentCart, ...recipes]);
  }

  removeRecipesFromCart(recipes: RecipeWithId[]) {
    const recipeIdsToRemove = recipes.map((item) => item.id);

    const updatedRecipes = this.mealState().cart.filter(
      (item) => !recipeIdsToRemove.includes(item.id)
    );

    this.updateProperty('cart', updatedRecipes);
  }

  toggleRecipeView() {
    const currentValue = this.mealState().recipesDisplayedViaCards;

    this.updateProperty('recipesDisplayedViaCards', !currentValue);
  }

  updateRatio(type: string) {
    const currentValue = this.mealState().ratio;

    if (type === 'decrease') {
      if (this.mealState().ratio > 1) {
        this.updateProperty('ratio', currentValue - 1);
      }
    } else {
      if (this.mealState().ratio < 10) {
        this.updateProperty('ratio', currentValue + 1);
      }
    }
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof MealState>(key: key, value: MealState[key]) {
    this.mealState.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
