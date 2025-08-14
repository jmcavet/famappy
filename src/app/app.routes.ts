import { Routes } from '@angular/router';
import { manageIngredientsRoutes } from './features/manage-ingredients/manage-ingredients.routes';
import { authentificationRoutes } from './authentification/authentification.routes';
import { recipesRoutes } from './features/recipes/recipes.routes';
import { settingsRoutes } from './shared/components/settings/settings.routes';
import { homeRoutes } from './features/home/home.routes';
import { cuisineRoutes } from './features/cuisine/cuisine.routes';
import { ingredientCategoriesRoutes } from './features/ingredient-categories/ingredient-categories.routes';
import { manageCuisinesRoutes } from './features/manage-cuisines/manage-cuisines.routes';
import { manageIngredientCategoriesRoutes } from './features/manage-ingredient-categories/manage-ingredient-categories.routes';
import { manageMealCategoryRoutes } from './features/manage-meal-categories/manage-meal-category.routes';
import { manageRecipeCategoriesRoutes } from './features/manage-recipe-categories/manage-recipe-categories.routes';
import { mealCategoryRoutes } from './features/meal-category/meal-category.routes';
import { notFoundRoutes } from './features/not-found/not-found.routes';
import { ingredientsRoutes } from './features/ingredients/ingredients.routes';
import { membersRoutes } from './features/members/members.routes';
import { newRecipeRoutes } from './features/new-recipe/new-recipe.routes';
import { filterIngredientsRoutes } from './features/filter-ingredients/filter-ingredients.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  ...homeRoutes,
  ...authentificationRoutes,
  ...cuisineRoutes,
  ...ingredientCategoriesRoutes,
  ...ingredientsRoutes,
  ...manageCuisinesRoutes,
  ...manageIngredientCategoriesRoutes,
  ...manageIngredientsRoutes,
  ...manageMealCategoryRoutes,
  ...manageRecipeCategoriesRoutes,
  ...mealCategoryRoutes,
  ...membersRoutes,
  ...newRecipeRoutes,
  ...filterIngredientsRoutes,
  ...recipesRoutes,
  ...settingsRoutes,
  ...notFoundRoutes, // At the end!
];
