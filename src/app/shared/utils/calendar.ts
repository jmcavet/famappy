import { CalendarDay } from '../../features/meals/components/calendar/calendar.facade';

export const dayNames = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getWeekDays() {
  const weekDays: CalendarDay[] = [];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayName = dayNames[d.getDay()];
    const dayOfMonth = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();

    weekDays.push({ dayName, dayOfMonth, monthName, year });
  }

  return weekDays;
}
