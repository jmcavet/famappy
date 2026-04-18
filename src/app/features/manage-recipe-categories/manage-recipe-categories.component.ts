import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ManageRecipeCategoryFacade } from './manage-recipe-category.facade';

@Component({
  selector: 'app-manage-recipe-categories',
  imports: [CapitalizePipe, LoadingComponent],
  providers: [ManageRecipeCategoryFacade],
  templateUrl: './manage-recipe-categories.component.html',
  styleUrl: './manage-recipe-categories.component.css',
})
export class ManageRecipeCategoriesComponent {
  /** Dependencies (injected) */
  private facade = inject(ManageRecipeCategoryFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes = this.facade.dbRecipes;
  readonly dbRecipeCategories = this.facade.dbRecipeCategories;
  readonly canShowPage = this.facade.canShowPage;

  openAddRecipeCategoryInputModal(event: MouseEvent) {
    this.facade.openAddRecipeCategoryInputModal(event);
  }

  openUpdateRecipeCategoryInputModal(event: MouseEvent, recipeCategory: any) {
    this.facade.openUpdateRecipeCategoryInputModal(event, recipeCategory);
  }

  openDeleteModal(event: MouseEvent, recipeCategoryId: string) {
    this.facade.openDeleteModal(event, recipeCategoryId);
  }
}
