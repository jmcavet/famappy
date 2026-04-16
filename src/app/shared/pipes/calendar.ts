import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calendar',
})
export class CalendarPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.slice(0, 3);
  }
}
