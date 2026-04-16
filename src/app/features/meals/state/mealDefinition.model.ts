import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';

export interface MealDefinitionState {
  plannedMealsCount: number;
  mealCategoriesSelected: RecipeCategoryDocInBackend[];
}
