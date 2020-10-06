import { areIntervalsOverlapping } from 'date-fns';

import { stringsToDateArray } from '~/app/utils/date';

import prisma from '~/prisma';

async function isPeriodOverlappingOtherOnDatabase(initialDate: Date, endDate: Date, ignoreId?: number) {
  const periods = await prisma.periods.findMany({});

  for (let i = 0; i < periods.length; i += 1) {
    if (periods[i].id === ignoreId) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const [dbInitialDate, dbEndDate] = stringsToDateArray(periods[i].initialHour, periods[i].endHour);

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

export async function assertPeriodIsNotOverlappingOnDatabase(initialDate: Date, endDate: Date, ignoreId?: number) {
  const areOverlapping = await isPeriodOverlappingOtherOnDatabase(initialDate, endDate, ignoreId);

  if (areOverlapping) {
    throw new Error('Não é possível colocar dois turnos no mesmo intervalo');
  }
}

export async function assertPeriodExists(id: number) {
  const period = await prisma.periods.findOne({
    where: { id },
  });

  if (!period) {
    throw new Error('Turno não encontrado');
  }

  return period;
}
