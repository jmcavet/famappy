import { Routes } from '@angular/router';
import { ManageIngredientCategoriesComponent } from './manage-ingredient-categories.component';

export const manageIngredientCategoriesRoutes: Routes = [
  {
    path: 'manage-ingredient-categories',
    component: ManageIngredientCategoriesComponent,
    data: {
      title: 'Manage ingredient categories',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
];
