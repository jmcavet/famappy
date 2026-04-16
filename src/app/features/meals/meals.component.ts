import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MealDayCardComponent } from './components/meal-day-card/meal-day-card.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { MealFacade } from './meals.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-meals',
  imports: [
    RouterLink,
    CalendarComponent,
    MealDayCardComponent,
    LoadingComponent,
    ButtonComponent,
  ],
  templateUrl: './meals.component.html',
  styleUrl: './meals.component.css',
})
export class MealsComponent {
  // Facade services
  private mealFacade = inject(MealFacade);

  /** UI-only view state */
  readonly dailyMealPlans = this.mealFacade.dailyMealPlans;
  readonly dataIsLoading = this.mealFacade.dataIsLoading;
}
