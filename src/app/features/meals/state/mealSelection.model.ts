import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';

export type SelectionViewMode = 'Card' | 'List';

export interface MealSelectionState {
  cart: RecipeWithId[];
  ratio: number;
  ingredientCategoriesSelected: any[];
  ingredientsSelected: any[];
  mealCategoryIdSelected: string;
  viewMode: SelectionViewMode;
}
