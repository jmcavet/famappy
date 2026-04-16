import { Component, inject, input, Input } from '@angular/core';
import { MealWithId } from '../../state/mealCart.model';
import { MealCookSelectionFacade } from './meal-cook-selection.facade';
import { CalendarDay } from '../calendar/calendar.facade';
import { MemberDomainFacade } from '../../../../domain-facades/member.facade';
import { ContextMenuService } from '../../../../shared/context-menu/context-menu-host/context-menu.service';
import { ContextMenuCooksComponent } from '../../../../shared/context-menu/context-menu-cooks/context-menu-cooks.component';

@Component({
  selector: 'app-meal-cook-selection',
  imports: [],
  providers: [MealCookSelectionFacade],
  templateUrl: './meal-cook-selection.component.html',
  styleUrl: './meal-cook-selection.component.css',
})
export class MealCookSelectionComponent {
  /** Inputs */
  @Input() mealType: string = 'lunch';
  dailyMealPerMealType = input.required<MealWithId[]>();
  selectedDay = input.required<CalendarDay>();
  cookName = input.required<string>();

  /** Facade services */
  private facade = inject(MealCookSelectionFacade);
  private _memberDomainFacade = inject(MemberDomainFacade);

  private contextMenuService = inject(ContextMenuService);

  /** UI values */
  canAssignCook = this.facade.canAssignCook;
  cookIsFirstParent = this.facade.cookIsFirstParent;
  cookPosition = this.facade.cookPosition;
  parents = this._memberDomainFacade.parents;

  ngOnInit() {
    this.facade.connect(
      this.selectedDay,
      this.mealType,
      this.dailyMealPerMealType,
      this.parents,
      this.cookName,
    );
  }

  openContextMenu(event: MouseEvent) {
    this.contextMenuService.open(ContextMenuCooksComponent, event, {
      selectedDay: this.selectedDay(),
      mealType: this.mealType,
      dailyMealPerMealType: this.dailyMealPerMealType(),
    });
  }
}
