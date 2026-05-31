import { Component, inject, input } from '@angular/core';
import { MealOptionsContextMenuFacade } from './meal-options-context-menu.facade';
import { ManualEntryComponent } from '../manual-entry/manual-entry.component';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ContextMenuService } from '../../../../shared/layout/overlays/context-menu/context-menu-host/context-menu.service';

@Component({
  selector: 'app-meal-options-context-menu',
  imports: [],
  templateUrl: './meal-options-context-menu.component.html',
  styleUrl: './meal-options-context-menu.component.css',
})
export class MealOptionsContextMenuComponent {
  dailyMealPlan = input.required<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();
  mealType = input.required<MealType>();

  private contextMenuService = inject(ContextMenuService);
  private modalService = inject(ModalService);
  private facade = inject(MealOptionsContextMenuFacade);

  navigateToRecipes() {
    this.contextMenuService.close();
    this.facade.navigateToRecipes(this.dailyMealPlan, this.mealType);
  }

  openManualEntryModal() {
    this.contextMenuService.close();
    this.modalService.open(ManualEntryComponent, {
      title: 'Manual Entry',
      dailyMealPlan: this.dailyMealPlan(),
      mealType: this.mealType(),
    });
  }
}
