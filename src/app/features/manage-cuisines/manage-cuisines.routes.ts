import { Routes } from '@angular/router';
import { ManageCuisinesComponent } from './manage-cuisines.component';

export const manageCuisinesRoutes: Routes = [
  {
    path: 'manage-cuisines',
    component: ManageCuisinesComponent,
    data: { title: 'Manage Cuisines', showBackIcon: true },
  },
];
