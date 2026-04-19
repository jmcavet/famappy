import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ManageIngredientCategoriesFacade } from './manage-ingredient-categories.facade';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [FormsModule, LoadingComponent],
  providers: [ManageIngredientCategoriesFacade],
  templateUrl: './manage-ingredient-categories.component.html',
  styleUrl: './manage-ingredient-categories.component.css',
})
export class ManageIngredientCategoriesComponent {
  /** Services */
  private facade = inject(ManageIngredientCategoriesFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories = this.facade.dbIngredientCategories;
  readonly canShowPage = this.facade.canShowPage;

  openAddIngredientCategoryInputModal(event: MouseEvent) {
    this.facade.openAddIngredientCategoryInputModal(event);
  }

  openUpdateIngredientCategoryInputModal(
    event: MouseEvent,
    ingredientCategory: any,
  ) {
    this.facade.openUpdateIngredientCategoryInputModal(
      event,
      ingredientCategory,
    );
  }

  openDeleteIngredientCategoryModal(
    event: MouseEvent,
    ingredientCategoryId: string,
  ) {
    this.facade.openDeleteIngredientCategoryModal(event, ingredientCategoryId);
  }
}
