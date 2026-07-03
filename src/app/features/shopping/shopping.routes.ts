import { Routes } from '@angular/router';
import { ShoppingMealsSelectionComponent } from './shopping-meals-selection/shopping-meals-selection.component';
import { ShoppingComponent } from './shopping.component';
import { ShoppingIngredientsSelectionComponent } from './shopping-ingredients-selection/shopping-ingredients-selection.component';

export const shoppingRoutes: Routes = [
  {
    path: 'shopping',
    children: [
      {
        path: '',
        component: ShoppingComponent,
        data: {
          title: 'Shopping',
          showBackIcon: false,
          showHomeIcon: true,
        },
      },
      {
        path: 'meals-selection',
        component: ShoppingMealsSelectionComponent,
        data: {
          title: 'Meals Selection',
        },
      },
      {
        path: 'ingredients-selection',
        component: ShoppingIngredientsSelectionComponent,
        data: {
          title: 'Ingredients Selection',
        },
      },
    ],
  },
];
