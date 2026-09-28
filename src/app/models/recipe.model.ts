import { RecipeIngredient } from './ingredient.model';

export type Difficulty = 'easy' | 'medium' | 'hard';
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
    ingredientFilterMode: number;
  };
  nbFilters: number;
  imageUrl: null | string;
  thumbnailUrl: string;
}

export type RecipeDocInBackend = Pick<
  RecipeState,
  | 'title'
  | 'preparationTime'
  | 'cookingTime'
  | 'servings'
  | 'difficulty'
  | 'price'
  | 'frequency'
  | 'seasonsSelected'
  | 'recipeCategoryIds'
  | 'mealCategoryId'
  | 'cuisineId'
  | 'source'
  | 'comment'
  | 'ingredients'
  | 'instructions'
  | 'imageUrl'
  | 'thumbnailUrl'
>;

export function toRecipeDocInBackend(state: RecipeState): RecipeDocInBackend {
  return {
    title: state.title,
    preparationTime: state.preparationTime,
    cookingTime: state.cookingTime,
    servings: state.servings,
    difficulty: state.difficulty,
    price: state.price,
    frequency: state.frequency,
    seasonsSelected: [...state.seasonsSelected],
    recipeCategoryIds: [...state.recipeCategoryIds],
    mealCategoryId: state.mealCategoryId,
    cuisineId: state.cuisineId,
    source: state.source,
    comment: state.comment,
    ingredients: state.ingredients.map((ingredient) => ({ ...ingredient })),
    instructions: [...state.instructions],
    imageUrl: state.imageUrl,
    thumbnailUrl: state.thumbnailUrl,
  };
}
