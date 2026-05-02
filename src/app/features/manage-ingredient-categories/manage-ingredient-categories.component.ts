import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ManageIngredientCategoriesFacade } from './manage-ingredient-categories.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [FormsModule, ButtonComponent, LoadingComponent],
  providers: [ManageIngredientCategoriesFacade],
  templateUrl: './manage-ingredient-categories.component.html',
  styleUrl: './manage-ingredient-categories.component.css',
})
export class ManageIngredientCategoriesComponent {
  /** Services */
  private facade = inject(ManageIngredientCategoriesFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories = this.facade.dbIngredientCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  openAddModal(event: MouseEvent) {
    this.facade.openAddModal(event);
  }

  openUpdateModal(event: MouseEvent, ingredientCategory: any) {
    this.facade.openUpdateModal(event, ingredientCategory);
  }

  openDeleteModal(event: MouseEvent, ingredientCategoryId: string) {
    this.facade.openDeleteModal(event, ingredientCategoryId);
  }
}
