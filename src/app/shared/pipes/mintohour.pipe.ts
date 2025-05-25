import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mintohour',
})
export class MinToHourPipe implements PipeTransform {
  transform(totalMinutes: number): string {
    if (!totalMinutes) return '';
    if (totalMinutes < 60) return String(`${totalMinutes}m`);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hoursStr = hours > 0 ? `${hours}h` : '';
    const minutesStr = minutes > 0 ? `${minutes}m` : '';

    return `${hoursStr}${minutesStr}`.trim();
  }
}
