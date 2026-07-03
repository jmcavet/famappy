export interface ShoppingState {
  shoppingListTitle: string;
  shoppingMealsSelected: any[];
  ingredientCategoryIdSelected: string;
  measures: { id: string; measure: number }[];
  units: string[];
}
