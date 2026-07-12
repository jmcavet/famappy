export interface ShoppingCategoryWithoutId {
  name: string;
  categoryId: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Ingredient by id
export interface ShoppingCategoryWithId extends ShoppingCategoryWithoutId {
  id: string;
}

export interface ShoppingCategoryWithIdAndDate extends ShoppingCategoryWithId {
  dateCreated: string;
}

export interface ShoppingCategoryDocInBackend {
  id: string;
  name: string;
  // items: string[];
  dateCreated: string;
}
