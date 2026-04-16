import { Injectable, signal } from '@angular/core';
import {
  CuisineDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import {
  Difficulty,
  Frequency,
  MealFilterState,
  Season,
} from './mealFilter.model';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class MealFilterStateService {
  initialState: MealFilterState = {
    cuisinesSelected: [],
    seasonsSelected: [],
    difficultiesSelected: [],
    frequenciesSelected: [],
    recipeCategoryIds: [],
    recipesFiltered: [],
    recipeCategoryMode: 0,
  };

  state = signal<MealFilterState>(this.initialState);

  setSeason(seasonSelected: Season) {
    let seasonsUpdated;

    if (this.state().seasonsSelected.includes(seasonSelected)) {
      const index = this.state().seasonsSelected.indexOf(seasonSelected);
      seasonsUpdated = this.state().seasonsSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      seasonsUpdated = [...this.state().seasonsSelected, seasonSelected];
    }

    this.updateProperty('seasonsSelected', seasonsUpdated);
  }

  setCuisine(cuisineSelected: CuisineDocInBackend) {
    let cuisinesUpdated;

    if (this.state().cuisinesSelected.includes(cuisineSelected)) {
      const index = this.state().cuisinesSelected.indexOf(cuisineSelected);
      cuisinesUpdated = this.state().cuisinesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      cuisinesUpdated = [...this.state().cuisinesSelected, cuisineSelected];
    }

    this.updateProperty('cuisinesSelected', cuisinesUpdated);
  }

  setDifficulty(difficultySelected: Difficulty) {
    let difficultiesUpdated;

    if (this.state().difficultiesSelected.includes(difficultySelected)) {
      const index =
        this.state().difficultiesSelected.indexOf(difficultySelected);
      difficultiesUpdated = this.state().difficultiesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      difficultiesUpdated = [
        ...this.state().difficultiesSelected,
        difficultySelected,
      ];
    }

    this.updateProperty('difficultiesSelected', difficultiesUpdated);
  }

  setFrequency(frequencySelected: Frequency) {
    let frequenciesUpdated;

    if (this.state().frequenciesSelected.includes(frequencySelected)) {
      const index = this.state().frequenciesSelected.indexOf(frequencySelected);
      frequenciesUpdated = this.state().frequenciesSelected.filter(
        (_, i) => i !== index,
      );
    } else {
      frequenciesUpdated = [
        ...this.state().frequenciesSelected,
        frequencySelected,
      ];
    }
    this.updateProperty('frequenciesSelected', frequenciesUpdated);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    let recipeCategoryIdsUpdated;

    if (this.state().recipeCategoryIds.includes(recipeCategorySelected.id)) {
      const index = this.state().recipeCategoryIds.indexOf(
        recipeCategorySelected.id,
      );
      recipeCategoryIdsUpdated = this.state().recipeCategoryIds.filter(
        (_, i) => i !== index,
      );
    } else {
      recipeCategoryIdsUpdated = [
        ...this.state().recipeCategoryIds,
        recipeCategorySelected.id,
      ];
    }

    this.updateProperty('recipeCategoryIds', recipeCategoryIdsUpdated);

    console.log('AAA: ', this.state().recipesFiltered);
  }

  computeRecipesFiltered(dbRecipes: RecipeWithId[], position: number = 0) {
    const recipesUpdatedByCuisine =
      this.state().cuisinesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.state()
              .cuisinesSelected.map((el) => el.id)
              .includes(recipe.cuisineId),
          )
        : dbRecipes;

    const recipesUpdatedBySeason =
      this.state().seasonsSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.state().seasonsSelected.some((item) =>
              recipe.seasonsSelected.includes(item),
            ),
          )
        : dbRecipes;

    const recipesUpdatedByFrequency =
      this.state().frequenciesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.state().frequenciesSelected.includes(recipe.frequency),
          )
        : dbRecipes;

    const recipesUpdatedByDifficulty =
      this.state().difficultiesSelected.length > 0
        ? dbRecipes.filter((recipe) =>
            this.state().difficultiesSelected.includes(recipe.difficulty),
          )
        : dbRecipes;

    let recipesUpdatedByRecipeCategory;
    if (position === 0) {
      recipesUpdatedByRecipeCategory =
        this.state().recipeCategoryIds.length > 0
          ? dbRecipes.filter((recipe) =>
              this.state().recipeCategoryIds.some((item) =>
                recipe.recipeCategoryIds.includes(item),
              ),
            )
          : dbRecipes;
    } else {
      recipesUpdatedByRecipeCategory =
        this.state().recipeCategoryIds.length > 0
          ? dbRecipes.filter((recipe) =>
              this.state().recipeCategoryIds.every((item) =>
                recipe.recipeCategoryIds.includes(item),
              ),
            )
          : dbRecipes;
    }

    const ids2 = new Set(recipesUpdatedBySeason.map((o) => o.id));
    const ids3 = new Set(recipesUpdatedByFrequency.map((o) => o.id));
    const ids4 = new Set(recipesUpdatedByDifficulty.map((o) => o.id));
    const ids5 = new Set(recipesUpdatedByRecipeCategory.map((o) => o.id));

    const recipes = recipesUpdatedByCuisine.filter(
      (o) =>
        ids2.has(o.id) && ids3.has(o.id) && ids4.has(o.id) && ids5.has(o.id),
    );

    this.filterRecipes(recipes);
  }

  filterRecipes(recipes: RecipeWithId[]) {
    this.updateProperty('recipesFiltered', recipes);
  }

  /**
   * Update a property from the recipe state based on its key, index and new name.
   *
   * @param indexToUpdate - The index of the property to be updated.
   */
  updateProperty<key extends keyof MealFilterState>(
    key: key,
    value: MealFilterState[key],
  ) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }
}
