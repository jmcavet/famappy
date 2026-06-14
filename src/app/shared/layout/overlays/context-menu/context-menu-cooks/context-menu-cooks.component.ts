import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ContextMenuCooksFacade } from './context-menu-cooks.facade';
import { CalendarDay } from '../../../../../features/meals/components/calendar/calendar.facade';
import {
  MealType,
  MealWithId,
} from '../../../../../features/meals/state/mealCart.model';
import { MemberWithId } from '../../../../../features/members/components/member/member.model';
import { LoadingComponent } from '../../loading/loading.component';
import { StackComponent } from '../../../primitives/stack.component';
import { SectionComponent } from '../../../primitives/section.component';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { NgClass } from '@angular/common';

export interface CookMenuContext {
  selectedDay: Signal<CalendarDay>;
  mealType: Signal<MealType>;
  dailyMealPerMealType: Signal<MealWithId[]>;
  cookName: Signal<string>;
}

@Component({
  selector: 'app-context-menu-cooks',
  imports: [
    LoadingComponent,
    SectionComponent,
    StackComponent,
    ButtonComponent,
    NgClass,
  ],
  templateUrl: './context-menu-cooks.component.html',
  styleUrl: './context-menu-cooks.component.css',
  providers: [ContextMenuCooksFacade],
})
export class ContextMenuCooksComponent implements OnInit {
  /** Inputs from parent component */
  selectedDay = input.required<CalendarDay>();
  mealType = input.required<MealType>();
  dailyMealPerMealType = input.required<MealWithId[]>();
  cookName = input.required<string>();

  private ctx: CookMenuContext = {
    selectedDay: this.selectedDay,
    mealType: this.mealType,
    dailyMealPerMealType: this.dailyMealPerMealType,
    cookName: this.cookName,
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
