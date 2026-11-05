import {
  addDays,
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInCalendarDays,
  isValid,
} from "date-fns";
export const demoToday = "2026-11-05";
export const shift = (day: string, n: number) =>
  format(addDays(parseISO(day), n), "yyyy-MM-dd");
export const days = (start: string, end: string) =>
  differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;
export function range(preset: string) {
  const date = parseISO(demoToday);
  if (preset === "week")
    return {
      start: format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      end: demoToday,
    };
  if (preset === "last")
    return {
      start: format(startOfMonth(subMonths(date, 1)), "yyyy-MM-dd"),
      end: format(endOfMonth(subMonths(date, 1)), "yyyy-MM-dd"),
    };
  if (preset === "12weeks")
    return { start: shift(demoToday, -83), end: demoToday };
  return { start: format(startOfMonth(date), "yyyy-MM-dd"), end: demoToday };
}
export const previous = (start: string, end: string) => ({
  start: shift(start, -days(start, end)),
  end: shift(start, -1),
});
export const validRange = (start: string, end: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(start) &&
  /^\d{4}-\d{2}-\d{2}$/.test(end) &&
  isValid(parseISO(start)) &&
  isValid(parseISO(end)) &&
  start <= end;
