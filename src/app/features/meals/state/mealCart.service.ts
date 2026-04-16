import { Injectable, signal } from '@angular/core';
import { Meal, MealCartState, MealType } from './mealCart.model';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { MemberWithId } from '../../members/components/member/member.model';

@Injectable({
  providedIn: 'root',
})
export class MealCartStateService {
  initialState: MealCartState = {
    cart: [],
    finalCart: [],
    selectedDay: { dayName: '', dayOfMonth: 1, monthName: '', year: 2026 },
    selectedRecipes: [],
  };

  state = signal<MealCartState>(this.initialState);

  addRecipesToCart(recipes: RecipeWithId[]) {
    const currentCart = this.state().cart;
    this.updateProperty('cart', [...currentCart, ...recipes]);
  }

  removeRecipesFromCart() {
    const recipes = this.state().selectedRecipes;
    const recipeIdsToRemove = recipes.map((item) => item.id);

    const updatedRecipes = this.state().cart.filter(
      (item) => !recipeIdsToRemove.includes(item.id),
    );

    this.updateProperty('cart', updatedRecipes);
  }

  resetSelectedRecipes() {
    this.updateProperty('selectedRecipes', []);
  }

  assignCook(mealType: string, weekDayName: string, cookId: string) {
    this.state.update((state) => {
      return {
        ...state,
        finalCart: state.finalCart.map((item) => ({
          ...item,
          cookId:
            weekDayName === item.weekDay.dayName && mealType === item.mealType
              ? cookId
              : item.cookId,
        })),
      };
    });
  }

  allocateRecipesToWeekDay(
    mealType: MealType,
    servings: number,
    cookId: string | null,
  ) {
    const { selectedDay, selectedRecipes, finalCart } = this.state();

    console.log('ABC: cookId: ', cookId);

    const newMeals: Meal[] = selectedRecipes.map((recipe) => ({
      weekDay: selectedDay,
      recipe,
      mealType,
      servings,
      cookId,
      manualRecipe: null,
    }));

    this.updateProperty('finalCart', [...finalCart, ...newMeals]);
  }

  increaseServings(mealType: string) {
    this.state.update((state) => ({
      ...state,
      finalCart: state.finalCart.map((meal) =>
        meal.mealType === mealType && meal.weekDay === this.state().selectedDay
          ? { ...meal, servings: meal.servings + 1 }
          : meal,
      ),
    }));
  }

  decreaseServings(mealType: string) {
    this.state.update((state) => ({
      ...state,
      finalCart: state.finalCart.map((meal) =>
        meal.mealType === mealType && meal.weekDay === this.state().selectedDay
          ? { ...meal, servings: meal.servings - 1 }
          : meal,
      ),
    }));
  }

  getMealServings(mealType: MealType): number | undefined {
    return this.state().finalCart.find(
      (m) =>
        m.weekDay.dayName === this.state().selectedDay.dayName &&
        m.mealType === mealType,
    )?.servings;
  }

  getCookId(mealType: MealType) {
    return this.state().finalCart.find(
      (m) =>
        m.weekDay.dayName === this.state().selectedDay.dayName &&
        m.mealType === mealType,
    )?.cookId;
  }

  removeRecipeFromWeekDay(recipe: RecipeWithId) {
    const recipeIdToRemove = recipe.id;

    const updatedRecipes = this.state().finalCart.filter(
      (item) => recipeIdToRemove !== item.recipe?.id,
    );

    this.updateProperty('finalCart', updatedRecipes);
    console.log('AFTER: ', this.state().finalCart);
  }

  updateProperty<key extends keyof MealCartState>(
    key: key,
    value: MealCartState[key],
  ) {
    this.state.update((state) => {
      return {
        ...state,
        [key]: value,
      };
    });
  }

  resetFinalCart() {
    this.state.update((state) => ({
      ...state,
      finalCart: [],
    }));
  }
}
