import { Routes } from '@angular/router';
import { ManageMealCategoriesComponent } from './manage-meal-categories.component';

export const manageMealCategoryRoutes: Routes = [
  {
    path: 'manage-meal-categories',
    component: ManageMealCategoriesComponent,
    data: { title: 'Manage Meal Categories', showBackIcon: true },
  },
];
