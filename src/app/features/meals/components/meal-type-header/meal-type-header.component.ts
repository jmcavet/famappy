import { Component, inject, input, Input, Signal } from '@angular/core';
import { RecipeWithId } from '../../../recipes/components/recipe-card/recipe.model';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { MealCookSelectionComponent } from '../meal-cook-selection/meal-cook-selection.component';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { ModalServingsSelectionComponent } from '../modal-servings-selection/modal-servings-selection.component';
import { MealTypeHeaderFacade } from './meals-type-header.facade';
import { MealAddingOptionsComponent } from '../meal-adding-options/meal-adding-options.component';
import { CalendarDay } from '../calendar/calendar.facade';

@Component({
  selector: 'app-meal-type-header',
  imports: [
    MealCookSelectionComponent,
    CapitalizePipe,
    ModalServingsSelectionComponent,
    MealAddingOptionsComponent,
  ],
  providers: [MealTypeHeaderFacade],
  templateUrl: './meal-type-header.component.html',
  styleUrl: './meal-type-header.component.css',
})
export class MealTypeHeaderComponent {
  /** Inputs */
  @Input() showAssignButton: boolean = true;
  @Input() showServingIncrements: boolean = true;
  @Input({ required: true }) mealType: MealType = 'lunch';

  @Input() selectedRecipes: RecipeWithId[] = [];
  dailyMealPerMealType = input.required<MealWithId[]>();
  servings = input.required<Signal<number>>();
  dailyMealPlan = input<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();

  /** UI Facade */
  private facade = inject(MealTypeHeaderFacade);

  ngOnInit(): void {
    this.facade.connect(this.mealType, this.dailyMealPerMealType);
  }

  /** Rendered on UI */
  readonly selectedDay = this.facade.selectedDay;
  readonly membersAreLoaded = this.facade.membersAreLoaded;
  readonly uiServings = this.facade.uiServings;
  readonly uiCookName = this.facade.uiCookName;

  /** Public UI methods (click events, etc.) */
  assignMeal() {
    this.facade.allocateRecipesToWeekDay();
  }

  decreaseServings() {
    this.facade.decreaseServings();
  }

  increaseServings() {
    this.facade.increaseServings();
  }
}
