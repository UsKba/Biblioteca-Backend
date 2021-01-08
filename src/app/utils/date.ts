import { setSeconds, setMilliseconds, isBefore, subHours } from 'date-fns';

import { RequestError } from '../errors/request';

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

export function checkIsCorrectHourFormat(hour: string) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hour);
}

export function assertInitialDateIsBeforeEndDate(initialDate: Date, endDate: Date) {
  if (isBefore(endDate, initialDate)) {
    throw new RequestError('A hora final não pode ser antes da de inicio');
  }
}

export function removeDateTimezoneOffset(date: Date) {
  const dateWithoutTimezone = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return dateWithoutTimezone;
}

export function getDateOnBrazilTimezone(date: Date) {
  const dateWithoutTimezone = removeDateTimezoneOffset(date);
  const dateOnBrazil = subHours(dateWithoutTimezone, 3);

  return dateOnBrazil;
}

export function setScheduleHoursAndMinutes(date: Date, scheduleHours: string) {
  const [hours, minutes] = splitSingleDate(scheduleHours);

  const dateWithScheduleHours = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes);
  const dateWithoutTimezone = removeDateTimezoneOffset(dateWithScheduleHours);

  return dateWithoutTimezone;
}
