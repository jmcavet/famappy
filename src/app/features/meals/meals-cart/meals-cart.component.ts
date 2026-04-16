import { Component, inject } from '@angular/core';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { MealCartFacade } from './meals-cart.facade';
import { SummaryMealSectionComponent } from './components/summary-meal-section/summary-meal-section.component';
import { RouterLink } from '@angular/router';
import { MealRecipeItemComponent } from '../components/meal-recipe-item/meal-recipe-item.component';
import { CalendarComponent } from '../components/calendar/calendar.component';
import { MemberDomainFacade } from '../../../domain-facades/member.facade';
import { MealCategoryDomainFacade } from '../../../domain-facades/mealCategory.facade';
import { StepperComponent } from './components/stepper/stepper.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-meals-cart',
  imports: [
    CalendarComponent,
    MealRecipeItemComponent,
    SummaryMealSectionComponent,
    RouterLink,
    StepperComponent,
    ButtonComponent,
  ],
  templateUrl: './meals-cart.component.html',
  styleUrl: './meals-cart.component.css',
})
export class MealsCartComponent {
  /** Facade services */
  private _facade = inject(MealCartFacade);
  private _memberDomainFacade = inject(MemberDomainFacade);
  private _mealCategoryDomainFacade = inject(MealCategoryDomainFacade);

  ngOnInit() {
    this._facade.connect(this.dbMealCategories);
  }

  /** Not rendered on UI */
  dbMealCategories = this._mealCategoryDomainFacade.dbMealCategories;

  /** Rendered on UI */
  mealCategoriesSelected = this._facade.mealCategoriesSelected;
  selectedRecipes = this._facade.selectedRecipes;
  cart = this._facade.cart;
  finalCart = this._facade.finalCart;
  cartWithMealCategoryNames = this._facade.cartWithMealCategoryNames;
  cartMealCategoryIds = this._facade.cartMealCategoryIds;
  lunchServings = this._facade.lunchServings;
  dinnerServings = this._facade.dinnerServings;

  parents = this._memberDomainFacade.parents;

  /** Public UI methods (click events, etc.) */
  toggleRecipe(recipe: RecipeWithId) {
    this._facade.toggleRecipe(recipe);
  }

  async validateAssignment() {
    this._facade.validateAssignment();
  }
}
