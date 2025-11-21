import { IngredientDocInBackend, RecipeIngredient } from './ingredient.model';

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
  difficultiesSelected: Difficulty[];
  frequenciesSelected: Frequency[];
  cuisinesSelected: any[];
  recipeCategoryIds: string[];
  mealCategoryId: string;
  cuisineId: string;
  source: string;
  comment: string;
  ingredients: RecipeIngredient[];
  ingredient: string;
  ingredientId: string;
  selectedTabTitle: string;
  instructions: string[];
  filter: {
    mealCategories: string[];
    cuisines: string[];
    recipeCategories: string[];
    ingredientCategories: string[];
    ingredientIds: string[];
    difficulties: string[];
    prices: string[];
    frequencies: string[];
    seasons: string[];
  };
  nbFilters: number;
  imageUrl: null | string;
  thumbnailUrl: string;
}

export interface RecipeDocInBackend
  extends Omit<
    RecipeState,
    'ingredient' | 'ingredientId' | 'selectedTabTitle' | 'filter' | 'nbFilters'
  > {}
