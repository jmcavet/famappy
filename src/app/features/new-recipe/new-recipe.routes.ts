import { Routes } from '@angular/router';
import { NewRecipeComponent } from './new-recipe.component';

export const newRecipeRoutes: Routes = [
  {
    path: 'new-recipe',
    component: NewRecipeComponent,
    data: {
      title: 'Enter New Recipe',
      showDropdown: true,
      dropdownOptions: [
        {
          label: 'Manage meal categories',
          icon: 'fa-solid fa-cake-candles',
          url: 'manage-meal-categories',
        },
        {
          label: 'Manage cuisines',
          icon: 'fa-solid fa-flag',
          url: 'manage-cuisines',
        },
        {
          label: 'Manage recipe categories',
          icon: 'fa-solid fa-tag',
          url: 'manage-recipe-categories',
        },
        {
          label: 'Manage ingredient categories',
          icon: 'fa-solid fa-tag',
          url: 'manage-ingredient-categories',
        },
        {
          label: 'Manage ingredients',
          icon: 'fa-solid fa-carrot',
          url: 'manage-ingredients',
        },
      ],
    },
  },
];
