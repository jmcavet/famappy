import { Routes } from '@angular/router';
import { IngredientCategoriesComponent } from './ingredient-categories.component';

export const ingredientCategoriesRoutes: Routes = [
  {
    path: 'ingredient-categories',
    component: IngredientCategoriesComponent,
    data: {
      title: 'Ingredient categories',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
];
