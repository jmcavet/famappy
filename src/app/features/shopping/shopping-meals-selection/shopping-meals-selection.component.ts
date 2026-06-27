import { Component, computed, inject, signal } from '@angular/core';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { StepperComponent } from '../../meals/meals-cart/components/stepper/stepper.component';
import { GridComponent } from '../../../shared/layout/primitives/grid.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { RouterLink } from '@angular/router';
import { getWeekDays } from '../../../shared/utils/calendar';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { MealFacade } from '../../meals/meals.facade';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-shopping-meals-selection',
  imports: [
    RouterLink,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    StepperComponent,
    SectionComponent,
    StackComponent,
    InlineComponent,
    ButtonComponent,
    GridComponent,
    ChipComponent,
    CapitalizePipe,
    NgClass,
  ],
  templateUrl: './shopping-meals-selection.component.html',
  styleUrl: './shopping-meals-selection.component.css',
})
export class ShoppingMealsSelectionComponent {
  private mealFacade = inject(MealFacade);

  readonly dailyMealPlans = computed(() => this.mealFacade.dailyMealPlans());

  readonly dataIsLoading = computed(() => false);

  weekDays = getWeekDays();

  readonly selectedMeals = signal<{ dayName: string; mealType: string }[]>([]);

  public selectAll() {
    this.weekDays.forEach((day) => {
      const lunchIsPlanned = this.mealPlannedForDay(day.dayName, 'lunch');
      const dinnerIsPlanned = this.mealPlannedForDay(day.dayName, 'dinner');

      const dayName = day.dayName;

      if (lunchIsPlanned) {
        this.selectedMeals.update((previous) => [
          ...previous,
          { dayName, mealType: 'lunch' },
        ]);
      }
      if (dinnerIsPlanned) {
        this.selectedMeals.update((previous) => [
          ...previous,
          { dayName, mealType: 'dinner' },
        ]);
      }
    });
  }

  public toggleSelection(dayName: string, mealType: string) {
    const isSelected = this.isSelected(dayName, mealType);
    if (isSelected) {
      this.selectedMeals.update((previous) =>
        previous.filter(
          (meal) => !(meal.dayName === dayName && meal.mealType === mealType),
        ),
      );
    } else {
      this.selectedMeals.update((previous) => [
        ...previous,
        { dayName, mealType },
      ]);
    }
  }

  isSelected(dayName: string, mealType: string): boolean {
    return this.selectedMeals().some(
      (meal) => meal.dayName === dayName && meal.mealType === mealType,
    );
  }

  mealPlannedForDay(dayName: string, mealType: string) {
    const mealExists = this.dailyMealPlans()?.some((meal) => {
      const test1 = meal.recipes.some((recipe) => recipe.mealType === mealType);
      return (
        meal.weekDay.dayName === dayName && meal.recipes.length > 0 && test1
      );
    });

    return mealExists;
  }

  readonly vaidateButtonText = computed(() => {
    const nbMeals = this.selectedMeals().length;
    if (nbMeals === 1) return `Validate 1 meal`;
    if (nbMeals > 1) return `Validate ${nbMeals} meals`;
    else return 'Validate';
  });
}
