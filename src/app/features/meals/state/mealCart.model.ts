import { MemberWithId } from '../../members/components/member/member.model';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { CalendarDay } from '../components/calendar/calendar.facade';

export type MealType = 'lunch' | 'dinner';
export interface MealDocInBackend {
  weekDay: CalendarDay;
  recipeId?: string | null;
  mealType: MealType;
  servings: number;
  cookId: string | null;
  manualRecipe: { name: string; ingredients: string[] } | null;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Recipe by id
export interface MealDocWithIdInBackend extends MealDocInBackend {
  id: string;
}

export interface Meal {
  weekDay: CalendarDay;
  recipe: RecipeWithId | null;
  mealType: MealType;
  servings: number;
  cookId: string | null;
  manualRecipe: { name: string; ingredients: string[] } | null;
}

export interface MealWithId extends Meal {
  id: string;
}

export interface MealCartState {
  cart: RecipeWithId[];
  finalCart: Meal[];
  selectedDay: CalendarDay;
  selectedRecipes: RecipeWithId[];
}

export interface MealState {
  servings: number;
  currentNavStep: number;
}
