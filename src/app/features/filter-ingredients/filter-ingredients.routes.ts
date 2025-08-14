import { Routes } from '@angular/router';
import { FilterIngredientsComponent } from './filter-ingredients.component';

export const filterIngredientsRoutes: Routes = [
  {
    path: 'filter-ingredients',
    component: FilterIngredientsComponent,
    data: { title: 'Filter ingredients', showBackIcon: true },
  },
];
