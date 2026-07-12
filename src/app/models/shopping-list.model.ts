export interface ShoppingListWithoutId {
  name: string;
  categoryId: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Ingredient by id
export interface ShoppingListWithId extends ShoppingListWithoutId {
  id: string;
}

export interface ShoppingListWithIdAndDate extends ShoppingListWithId {
  dateCreated: string;
}

export interface ShoppingListDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
  ingredients: { id: string; measure: number }[];
  items: string[];
}
