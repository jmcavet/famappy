import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MealDayCardComponent } from './components/meal-day-card/meal-day-card.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MealFacade } from './meals.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { FooterComponent } from '../../shared/layout/shell/footer/footer.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  selector: 'app-meals',
  imports: [
    RouterLink,
    CalendarComponent,
    MealDayCardComponent,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    FooterComponent,
    CardComponent,
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
