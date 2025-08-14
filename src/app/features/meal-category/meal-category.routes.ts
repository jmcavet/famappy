import { Routes } from '@angular/router';
import { MealCategoryComponent } from './meal-category.component';

export const mealCategoryRoutes: Routes = [
  {
    path: 'meal-category',
    component: MealCategoryComponent,
    data: { title: 'Meal Category', showBackIcon: true },
  },
];
