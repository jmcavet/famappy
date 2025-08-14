import { Routes } from '@angular/router';
import { IngredientsComponent } from './ingredients.component';

export const ingredientsRoutes: Routes = [
  {
    path: 'ingredients',
    component: IngredientsComponent,
    data: { title: 'Ingredients', showHomeIcon: false, showBackIcon: true },
  },
];
