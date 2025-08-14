import { Routes } from '@angular/router';
import { RecipesComponent } from './recipes.component';
import { RecipeComponent } from './recipe/recipe.component';
import { RecipeFilterComponent } from './recipe-filter/recipe-filter.component';
import { HomeComponent } from '../home/home.component';

export const recipesRoutes: Routes = [
  {
    path: 'recipes',
    children: [
      {
        path: '',
        component: RecipesComponent,
        data: {
          title: 'Recipes',
          showBackIcon: true,
          showHomeIcon: false,
        },
      },
      {
        path: 'filter',
        component: RecipeFilterComponent,
        data: {
          title: 'Filter',
        },
      },
      {
        path: ':recipeId',
        component: RecipeComponent,
        data: {
          title: 'Recipe',
          showBackIcon: true,
          showHomeIcon: false,
          actions: [
            {
              icon: 'fa-solid fa-trash fa-lg',
              func: 'removeRecipe', // Reference to a method name
            },
          ],
        },
      },
    ],
  },
];
