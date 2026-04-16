import { Component, inject, Input, input, Signal } from '@angular/core';
import { MealTypeHeaderComponent } from '../../../components/meal-type-header/meal-type-header.component';
import { MealRecipeItemComponent } from '../../../components/meal-recipe-item/meal-recipe-item.component';
import { SummaryMealSectionFacade } from './summary-meal-section.facade';
import { MealCategoryDomainFacade } from '../../../../../domain-facades/mealCategory.facade';
import { MealType } from '../../../state/mealCart.model';

@Component({
  selector: 'app-summary-meal-section',
  imports: [MealRecipeItemComponent, MealTypeHeaderComponent],
  templateUrl: './summary-meal-section.component.html',
  styleUrl: './summary-meal-section.component.css',
})
export class SummaryMealSectionComponent {
  /** Facade services */
  private _facade = inject(SummaryMealSectionFacade);
  private _mealCategoryDomainFacade = inject(MealCategoryDomainFacade);

  @Input() mealType: MealType = 'lunch';
  servings = input.required<Signal<number>>();

  ngOnInit() {
    this._facade.connect(this.dbMealCategories);
  }

  /** Not rendered on UI */
  dbMealCategories = this._mealCategoryDomainFacade.dbMealCategories;

  /** Rendered on UI */
  readonly mealsWithCategoryName = this._facade.mealsWithCategoryName;
}
