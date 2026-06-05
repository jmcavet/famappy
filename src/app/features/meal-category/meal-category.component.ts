import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { MealCategoryFacade } from './meal-category.facade';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';

@Component({
  selector: 'app-meal-category',
  imports: [
    CapitalizePipe,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    LoadingComponent,
  ],
  providers: [MealCategoryFacade],
  templateUrl: './meal-category.component.html',
  styleUrl: './meal-category.component.css',
})
export class MealCategoryComponent {
  private facade = inject(MealCategoryFacade);

  readonly dbMealCategories = this.facade.dbMealCategories;
  readonly dbMealCategoriesSorted = this.facade.dbMealCategoriesSorted;
  readonly mealCategoryId = this.facade.mealCategoryId;
  readonly pageIsLoading = this.facade.pageIsLoading;

  selectMealCategory(mealCategoryId: string) {
    this.facade.selectMealCategory(mealCategoryId);
  }

  openInputModal(event: MouseEvent) {
    this.facade.openInputModal(event);
  }
}
