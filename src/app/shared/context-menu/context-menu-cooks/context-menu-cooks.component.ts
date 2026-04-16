import { Component, inject, input, OnInit, Signal } from '@angular/core';
import { ContextMenuCooksFacade } from './context-menu-cooks.facade';
import { MemberWithId } from '../../../features/members/components/member/member.model';
import {
  MealType,
  MealWithId,
} from '../../../features/meals/state/mealCart.model';
import { CalendarDay } from '../../../features/meals/components/calendar/calendar.facade';
import { LoadingComponent } from '../../components/loading/loading.component';

export interface CookMenuContext {
  selectedDay: Signal<CalendarDay>;
  mealType: Signal<MealType>;
  dailyMealPerMealType: Signal<MealWithId[]>;
}

@Component({
  selector: 'app-context-menu-cooks',
  imports: [LoadingComponent],
  templateUrl: './context-menu-cooks.component.html',
  styleUrl: './context-menu-cooks.component.css',
  providers: [ContextMenuCooksFacade],
})
export class ContextMenuCooksComponent implements OnInit {
  /** Inputs from parent component */
  selectedDay = input.required<CalendarDay>();
  mealType = input.required<MealType>();
  dailyMealPerMealType = input.required<MealWithId[]>();

  private ctx: CookMenuContext = {
    selectedDay: this.selectedDay,
    mealType: this.mealType,
    dailyMealPerMealType: this.dailyMealPerMealType,
  };

  /** Dependencies */
  private facade = inject(ContextMenuCooksFacade);

  /** Properties to show on template */
  parents = this.facade.parents;
  dataIsLoading = this.facade.dataIsLoading;

  ngOnInit() {
    this.facade.connect(this.ctx);
  }

  /** Methods triggered by template */
  assignCook(cook: MemberWithId) {
    this.facade.assignCook(cook.id);
  }
}
