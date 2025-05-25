export interface CuisineWithoutId {
  name: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the cuisine by id
export interface CuisineWithId extends CuisineWithoutId {
  id: string;
}

export interface CuisineWithIdAndDate extends CuisineWithId {
  dateCreated: string;
}

export interface MealCategoryWithoutId {
  name: string;
}

export interface MealCategoryWithId extends MealCategoryWithoutId {
  id: string;
}

export interface MealCategoryWithIdAndDate extends MealCategoryWithId {
  dateCreated: string;
}

export interface RecipeCategoryWithoutId {
  name: string;
}

export interface RecipeCategoryWithId extends RecipeCategoryWithoutId {
  id: string;
}

export interface RecipeCategoryWithIdAndDate extends RecipeCategoryWithId {
  dateCreated: string;
}

export interface IsAcending {
  date: boolean;
  type: boolean;
  name: boolean;
}
