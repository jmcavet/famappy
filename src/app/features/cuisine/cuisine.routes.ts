import { Routes } from '@angular/router';
import { CuisineComponent } from './cuisine.component';

export const cuisineRoutes: Routes = [
  {
    path: 'cuisine',
    component: CuisineComponent,
    data: { title: 'Cuisine', showBackIcon: true },
  },
];
