import { Routes } from '@angular/router';
import { ManageIngredientsComponent } from './manage-ingredients.component';

export const manageIngredientsRoutes: Routes = [
  {
    path: 'manage-ingredients',
    component: ManageIngredientsComponent,
    data: {
      title: 'Manage ingredients',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
];
