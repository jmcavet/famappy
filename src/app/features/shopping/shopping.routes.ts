import { Routes } from '@angular/router';
import { ShoppingMealsSelectionComponent } from './shopping-meals-selection/shopping-meals-selection.component';
import { ShoppingComponent } from './shopping.component';
import { ShoppingIngredientsSelectionComponent } from './shopping-ingredients-selection/shopping-ingredients-selection.component';
import { ShoppingListDefinitionComponent } from './shopping-list-definition/shopping-list-definition.component';

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
      {
        path: 'shopping-list-definition',
        component: ShoppingListDefinitionComponent,
        data: {
          title: 'Shopping List Definition',
        },
      },
    ],
  },
];
