// Used to add the document ID of the firestore object in order to eventually later on remove the cuisine by id
export interface CuisineDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
}

export interface MealCategoryDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
}

export interface RecipeCategoryDocInBackend {
  id: string;
  name: string;
  dateCreated: string;
}

export interface IsAcending {
  date: boolean;
  type: boolean;
  name: boolean;
}
