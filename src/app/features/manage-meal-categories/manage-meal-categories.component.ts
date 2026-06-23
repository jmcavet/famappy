import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ManageMealCategoryFacade } from './manage-meal-category.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-manage-meal-categories',
  imports: [
    CapitalizePipe,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
  ],
  providers: [ManageMealCategoryFacade],
  templateUrl: './manage-meal-categories.component.html',
  styleUrl: './manage-meal-categories.component.css',
})
export class ManageMealCategoriesComponent {
  private location = inject(Location);
  private facade = inject(ManageMealCategoryFacade);

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories = this.facade.dbMealCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  openAddMealCategoryInputModal(event: MouseEvent) {
    this.facade.openAddMealCategoryInputModal(event);
  }

  openUpdateMealCategoryInputModal(event: MouseEvent, mealCategory: any) {
    this.facade.openUpdateMealCategoryInputModal(event, mealCategory);
  }

  openDeleteModal(event: MouseEvent, mealCategoryId: string) {
    this.facade.openDeleteModal(event, mealCategoryId);
  }

  goBack() {
    this.location.back();
  }
}
