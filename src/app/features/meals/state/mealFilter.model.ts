import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';

export type Difficulty = 'low' | 'normal' | 'high';
export type Price = 'low' | 'normal' | 'high';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type Season = '' | 'spring' | 'summer' | 'autumn' | 'winter';

export interface MealFilterState {
  cuisinesSelected: any[];
  seasonsSelected: Season[];
  difficultiesSelected: Difficulty[];
  frequenciesSelected: Frequency[];
  recipeCategoryIds: any[];
  recipesFiltered: RecipeWithId[];
  recipeCategoryMode: number;
}
