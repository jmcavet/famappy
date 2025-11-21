import { RecipeWithId } from '../features/recipes/components/recipe-card/recipe.model';
import { RecipeCategoryDocInBackend } from './cuisine.model';

export type Difficulty = 'low' | 'normal' | 'high';
export type Price = 'low' | 'normal' | 'high';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type Season = '' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface MealState {
  nbPlannedMeals: number;
  mealCategoriesSelected: RecipeCategoryDocInBackend[];
  mealCategoryIds: string[];
  mealCategoryIdSelected: string;
  seasonsSelected: Season[];
  difficultiesSelected: Difficulty[];
  frequenciesSelected: Frequency[];
  cuisinesSelected: any[];
  recipeCategoryIds: any[];
  recipesFiltered: RecipeWithId[];
  ingredientCategoriesSelected: any[];
  ingredientsSelected: any[];
  cart: RecipeWithId[];
  ratio: number;
  recipesDisplayedViaCards: boolean;
}
