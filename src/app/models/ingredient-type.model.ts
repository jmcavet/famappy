export interface IngredientTypeWithoutId {
  name: string;
}

export interface IngredientType extends IngredientTypeWithoutId {
  id: string;
}

export interface IngredientTypeWithDate extends IngredientType {
  dateCreated: string;
}
