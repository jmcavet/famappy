import { Component, inject, input, Signal, signal } from '@angular/core';
import { MealTypeHeaderComponent } from '../meal-type-header/meal-type-header.component';
import { MealRecipeItemComponent } from '../meal-recipe-item/meal-recipe-item.component';
import { MealDayHeaderComponent } from '../meal-day-header/meal-day-header.component';
import { MealWithId } from '../../state/mealCart.model';
import { MealDayCardFacade } from './meal-day-card.facade';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealManualRecipeItemComponent } from '../meal-manual-recipe-item/meal-manual-recipe-item.component';

@Component({
  selector: 'app-meal-day-card',
  imports: [
    MealDayHeaderComponent,
    MealTypeHeaderComponent,
    MealRecipeItemComponent,
    MealManualRecipeItemComponent,
  ],
  providers: [MealDayCardFacade],
  templateUrl: './meal-day-card.component.html',
  styleUrl: './meal-day-card.component.css',
})
export class MealDayCardComponent {
  dailyMealPlan = input.required<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();

  mealsWithCategoryName = signal<any[]>([]);

  // Facade service
  private facade = inject(MealDayCardFacade);

  constructor() {
    this.facade.connect(this.dailyMealPlan);
  }

  dailyLunchMeals = this.facade.dailyLunchMeals;
  dailyDinnerMeals = this.facade.dailyDinnerMeals;

  lunchServings = this.facade.lunchServings;
  dinnerServings = this.facade.dinnerServings;
}
