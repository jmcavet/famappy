export interface IngredientWithoutId {
  name: string;
  typeId: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Ingredient by id
export interface IngredientWithId extends IngredientWithoutId {
  id: string;
}

export interface IngredientWithIdAndDate extends IngredientWithId {
  dateCreated: string;
}

export interface IngredientWithTypeName extends IngredientWithIdAndDate {
  typeName: string | undefined;
}

export interface IsAcending {
  date: boolean;
  type: boolean;
  name: boolean;
}

export interface Ingredient {
  name: string;
  measure: number;
  unit: string;
}
