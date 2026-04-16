import { RecipeWithId } from '../features/recipes/components/recipe-card/recipe.model';
import { RecipeCategoryDocInBackend } from './cuisine.model';

export type Difficulty = 'low' | 'normal' | 'high';
export type Price = 'low' | 'normal' | 'high';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type Season = '' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface MealState {
  mealCategoriesSelected: RecipeCategoryDocInBackend[];
  mealCategoryIds: string[];
  mealCategoryIdSelected: string;
  ingredientCategoriesSelected: any[];
  ingredientsSelected: any[];
  cart: RecipeWithId[];
  ratio: number;
}
