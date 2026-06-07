import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManageIngredientCategoriesFacade } from './manage-ingredient-categories.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [
    FormsModule,
    ButtonComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    LoadingComponent,
  ],
  providers: [ManageIngredientCategoriesFacade],
  templateUrl: './manage-ingredient-categories.component.html',
  styleUrl: './manage-ingredient-categories.component.css',
})
export class ManageIngredientCategoriesComponent {
  /** Services */
  private facade = inject(ManageIngredientCategoriesFacade);
  private location = inject(Location);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories = this.facade.dbIngredientCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  openUpdateModal(event: MouseEvent, ingredientCategory: any) {
    this.facade.openUpdateModal(event, ingredientCategory);
  }

  openDeleteModal(event: MouseEvent, ingredientCategoryId: string) {
    this.facade.openDeleteModal(event, ingredientCategoryId);
  }

  goBack() {
    this.location.back();
  }
}
