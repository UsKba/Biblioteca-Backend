import { areIntervalsOverlapping, isBefore } from 'date-fns';

import { stringsToDateArray } from '~/app/utils/date';

import prisma from '~/prisma';

export async function isScheduleOverlappingOtherOnDatabase(initialDate: Date, endDate: Date, ignoreId?: number) {
  const schedules = await prisma.schedules.findMany({});

  for (let i = 0; i < schedules.length; i += 1) {
    if (schedules[i].id === ignoreId) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const [dbInitialDate, dbEndDate] = stringsToDateArray(schedules[i].initialHour, schedules[i].endHour);

    const areOverlapping = areIntervalsOverlapping(
      { start: dbInitialDate, end: dbEndDate },
      { start: initialDate, end: endDate },
      { inclusive: false }
    );

    if (areOverlapping) {
      return true;
    }
  }

  return false;
}

export async function assertScheduleIsNotOverlappingOnDatabase(initialDate: Date, endDate: Date, ignoreId?: number) {
  const areOverlapping = await isScheduleOverlappingOtherOnDatabase(initialDate, endDate, ignoreId);

  if (areOverlapping) {
    throw new Error('Não é possível colocar dois horários no mesmo intervalo');
  }
}

export function assertInitialDateIsBeforeEndDate(initialDate: Date, endDate: Date) {
  if (isBefore(endDate, initialDate)) {
    throw new Error('A hora final não pode ser antes da de inicio');
  }
}

export async function assertIfScheduleExists(id: number) {
  const schedule = await prisma.schedules.findOne({
    where: { id },
  });

  if (schedule === null) {
    throw new Error('Horário não encontrado');
  }

  return schedule;
}
