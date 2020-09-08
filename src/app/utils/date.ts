import { setSeconds, setMilliseconds } from 'date-fns';

export function resetSecondsAndMiliseconds(value: number | string | Date) {
  const date = new Date(value);

  const targetDate = setSeconds(setMilliseconds(date, 0), 0);

  return targetDate;
}

export function splitSingleDate(dateStr: string) {
  const [hours, minutes] = dateStr.split(':');

  return [Number(hours), Number(minutes)] as [number, number];
}

export function stringToDate(dateStr: string) {
  const [hours, minutes] = splitSingleDate(dateStr);

  const targetDate = new Date().setHours(hours, minutes, 0, 0);

  return new Date(targetDate);
}

export function stringsToDateArray(dateStr1: string, dateStr2: string) {
  const date1 = stringToDate(dateStr1);
  const date2 = stringToDate(dateStr2);

  return [date1, date2] as [Date, Date];
}
