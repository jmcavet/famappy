import { Routes } from '@angular/router';
import { MealsComponent } from './meals.component';
import { HomeComponent } from '../home/home.component';
import { MealsDefinitionComponent } from './meals-definition/meals-definition.component';
import { MealsFilterComponent } from './meals-filter/meals-filter.component';
import { MealsSelectionComponent } from './meals-selection/meals-selection.component';
import { MealsCartComponent } from './meals-cart/meals-cart.component';

export const mealsRoutes: Routes = [
  {
    path: 'meals',
    children: [
      {
        path: '',
        component: MealsComponent,
        data: {
          title: 'Meals',
          showBackIcon: false,
          showHomeIcon: true,
        },
      },
      {
        path: 'definition',
        component: MealsDefinitionComponent,
        data: {
          title: 'Meals Definition',
        },
      },
      {
        path: 'filter',
        component: MealsFilterComponent,
        data: {
          title: 'Meals Filter',
        },
      },
      {
        path: 'selection',
        component: MealsSelectionComponent,
        data: {
          title: 'Meals Selection',
        },
      },
      {
        path: 'cart',
        component: MealsCartComponent,
        data: {
          title: 'Meals Cart',
        },
      },
    ],
  },
];
