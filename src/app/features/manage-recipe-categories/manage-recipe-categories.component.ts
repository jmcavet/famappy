import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ManageRecipeCategoryFacade } from './manage-recipe-category.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { FloatingButtonComponent } from '../../shared/layout/shell/floating-button/floating-button.component';

@Component({
  selector: 'app-manage-recipe-categories',
  imports: [CapitalizePipe, LoadingComponent, FloatingButtonComponent],
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
