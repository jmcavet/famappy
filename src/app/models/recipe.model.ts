import { RecipeCategoryWithIdAndDate } from './cuisine.model';
import { Ingredient } from './ingredient.model';

export type Difficulty = 'low' | 'normal' | 'high';
export type Price = 'low' | 'normal' | 'high';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type Season = '' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface RecipeState {
  title: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: Difficulty;
  price: Price;
  frequency: Frequency;
  seasonsSelected: Season[];
  recipeCategoriesSelected: RecipeCategoryWithIdAndDate[];
  mealCategory: string;
  cuisine: string;
  source: string;
  ingredients: Ingredient[];
  ingredient: string;
  selectedTabTitle: string;
  instructions: string[];
  favorite: boolean;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Recipe by id
export interface RecipeStateWithId extends RecipeState {
  id: string;
}
