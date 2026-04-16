import { Component, input, Input } from '@angular/core';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { MealAddingOptionsComponent } from '../meal-adding-options/meal-adding-options.component';
import { MealWithId } from '../../state/mealCart.model';
import { CalendarDay } from '../calendar/calendar.facade';

@Component({
  selector: 'app-meal-day-header',
  imports: [CapitalizePipe, MealAddingOptionsComponent],
  templateUrl: './meal-day-header.component.html',
  styleUrl: './meal-day-header.component.css',
})
export class MealDayHeaderComponent {
  dailyMealPlan = input.required<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();
}
