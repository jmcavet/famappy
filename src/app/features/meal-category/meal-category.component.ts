import { Component, inject } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { MealCategoryFacade } from './meal-category.facade';
import { FloatingButtonComponent } from '../../shared/layout/shell/floating-button/floating-button.component';

@Component({
  selector: 'app-meal-category',
  imports: [CapitalizePipe, FloatingButtonComponent],
  providers: [MealCategoryFacade],
  templateUrl: './meal-category.component.html',
  styleUrl: './meal-category.component.css',
})
export class MealCategoryComponent {
  private facade = inject(MealCategoryFacade);

  readonly dbMealCategories = this.facade.dbMealCategories;
  readonly mealCategoryId = this.facade.mealCategoryId;

  selectMealCategory(mealCategoryId: string) {
    this.facade.selectMealCategory(mealCategoryId);
  }

  openInputModal(event: MouseEvent) {
    this.facade.openInputModal(event);
  }
}
