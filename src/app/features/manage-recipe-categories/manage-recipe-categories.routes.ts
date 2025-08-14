import { Routes } from '@angular/router';
import { ManageRecipeCategoriesComponent } from './manage-recipe-categories.component';

export const manageRecipeCategoriesRoutes: Routes = [
  {
    path: 'manage-recipe-categories',
    component: ManageRecipeCategoriesComponent,
    data: { title: 'Manage recipe Categories', showBackIcon: true },
  },
];
