import { Period } from '@prisma/client';
import { areIntervalsOverlapping, isWithinInterval } from 'date-fns';

import { stringsToDateArray } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

export async function isScheduleOverlappingOtherOnDatabase(initialDate: Date, endDate: Date, ignoreId?: number) {
  const schedules = await prisma.schedule.findMany({});

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
    throw new RequestError('Não é possível colocar dois horários no mesmo intervalo');
  }
}

export async function assertIfScheduleExists(id: number) {
  const schedule = await prisma.schedule.findOne({
    where: { id },
  });

  if (!schedule) {
    throw new RequestError('Horário não encontrado');
  }

  return schedule;
}
