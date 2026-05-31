import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MealDayCardComponent } from './components/meal-day-card/meal-day-card.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MealFacade } from './meals.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';

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
