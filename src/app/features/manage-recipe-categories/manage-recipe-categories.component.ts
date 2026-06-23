import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ManageRecipeCategoryFacade } from './manage-recipe-category.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { FloatingButtonComponent } from '../../shared/layout/shell/floating-button/floating-button.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-manage-recipe-categories',
  imports: [
    CapitalizePipe,
    LoadingComponent,
    FloatingButtonComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
  ],
  providers: [ManageRecipeCategoryFacade],
  templateUrl: './manage-recipe-categories.component.html',
  styleUrl: './manage-recipe-categories.component.css',
})
export class ManageRecipeCategoriesComponent {
  /** Dependencies (injected) */
  private location = inject(Location);
  private facade = inject(ManageRecipeCategoryFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes = this.facade.dbRecipes;
  readonly dbRecipeCategories = this.facade.dbRecipeCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  openAddRecipeCategoryInputModal(event: MouseEvent) {
    this.facade.openAddRecipeCategoryInputModal(event);
  }

  openUpdateModal(event: MouseEvent, recipeCategory: any) {
    this.facade.openUpdateModal(event, recipeCategory);
  }

  openDeleteModal(event: MouseEvent, recipeCategoryId: string) {
    this.facade.openDeleteModal(event, recipeCategoryId);
  }

  goBack() {
    this.location.back();
  }
}
