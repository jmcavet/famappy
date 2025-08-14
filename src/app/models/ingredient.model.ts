export interface IngredientWithoutId {
  name: string;
  categoryId: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Ingredient by id
export interface IngredientWithId extends IngredientWithoutId {
  id: string;
}

export interface IngredientWithIdAndDate extends IngredientWithId {
  dateCreated: string;
}

export interface IngredientWithTypeName extends IngredientWithIdAndDate {
  categoryName: string | undefined;
}

export interface IngredientDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
  categoryId: string;
}

export interface IngredientCategoryDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
}

export type SortKey = 'name' | 'category' | 'dateCreated';

export type IsAcending = Record<SortKey, boolean>;

/** The ingredient object as one of the properties of the the recipe object */
export interface RecipeIngredient {
  id: string;
  name: string;
  measure: number;
  unit: string;
}
