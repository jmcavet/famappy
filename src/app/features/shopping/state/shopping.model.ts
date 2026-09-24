export interface ShoppingState {
  shoppingMealsSelected: any[];
  ingredientCategoryIdSelected: string;
  measures: { id: string; measure: number }[];
  units: string[];
  shoppingListNameSelected: string;
  methodSelected: string;
  shoppingCategoryNameSelected: string;
  currentNavStep: number;
}
