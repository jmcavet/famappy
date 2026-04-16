import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { CalendarPipe } from '../../../../shared/pipes/calendar';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { CalendarDay, CalendarFacade } from './calendar.facade';

@Component({
  selector: 'app-calendar',
  imports: [CalendarPipe, CapitalizePipe, LoadingComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit {
  /** UI Facade */
  private facade = inject(CalendarFacade);

  /** Rendered on UI */
  readonly selectedDay = this.facade.selectedDay;
  readonly parentNames = this.facade.parentNames;
  readonly dataLoading = this.facade.dataLoading;
  readonly weekDaysWithMeals = this.facade.weekDaysWithMeals;
  readonly calendarDaysWithCooks = this.facade.calendarDaysWithCooks;
  readonly weekDays = this.facade.weekDays;

  /** Public UI methods (click events, etc.) */
  ngOnInit() {
    this.facade.initialize();
  }

  constructor() {
    effect(() => {
      const day = this.selectedDay();
      if (!day) return;

      // schedule after DOM updates
      queueMicrotask(() => {
        const dayNames = this.weekDays().map((day) => day.dayName);
        const index = dayNames.indexOf(day.dayName);

        document.getElementById(`day-${index}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  }

  toggleDay(day: CalendarDay) {
    this.facade.toggleDay(day);
  }
}
