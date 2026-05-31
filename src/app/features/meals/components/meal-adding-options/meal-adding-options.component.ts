import { Component, inject, input } from '@angular/core';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { MealOptionsContextMenuComponent } from '../meal-options-context-menu/meal-options-context-menu.component';
import { ContextMenuService } from '../../../../shared/layout/overlays/context-menu/context-menu-host/context-menu.service';

@Component({
  selector: 'app-meal-adding-options',
  imports: [],
  templateUrl: './meal-adding-options.component.html',
  styleUrl: './meal-adding-options.component.css',
})
export class MealAddingOptionsComponent {
  private contextMenuService = inject(ContextMenuService);

  dailyMealPlan = input.required<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();

  mealType = input.required<MealType>();

  openContextMenu(event: MouseEvent) {
    this.contextMenuService.open(MealOptionsContextMenuComponent, event, {
      dailyMealPlan: this.dailyMealPlan(),
      mealType: this.mealType(),
    });
  }
}
