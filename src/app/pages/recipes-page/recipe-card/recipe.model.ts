import { Difficulty, RecipeState } from '../../../models/recipe.model';

// Represents an object of collection "recipes" in Firestore
export interface Recipe {
  name: string;
  mealCourseTypes: string[];
  origins: string[];
  seasons: string[];
  difficulty: string;
  preparationTime: number;
  cookingTime: number;
  price: string;
  sources: string[];
  favorite: boolean;
  frequency: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Recipe by id
export interface RecipeWithId extends RecipeState {
  id: string;
}
