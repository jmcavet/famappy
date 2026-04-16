import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ManageMealCategoryFacade } from './manage-meal-category.facade';

@Component({
  selector: 'app-manage-meal-categories',
  imports: [CapitalizePipe, LoadingComponent],
  providers: [ManageMealCategoryFacade],
  templateUrl: './manage-meal-categories.component.html',
  styleUrl: './manage-meal-categories.component.css',
})
export class ManageMealCategoriesComponent {
  private facade = inject(ManageMealCategoryFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories = this.facade.dbMealCategories;
  readonly canShowPage = this.facade.canShowPage;

  openAddMealCategoryInputModal(event: MouseEvent) {
    this.facade.openAddMealCategoryInputModal(event);
  }

  openUpdateMealCategoryInputModal(event: MouseEvent, mealCategory: any) {
    this.facade.openUpdateMealCategoryInputModal(event, mealCategory);
  }

  openDeleteModal(event: MouseEvent, mealCategoryId: string) {
    this.facade.openDeleteModal(event, mealCategoryId);
  }
}
