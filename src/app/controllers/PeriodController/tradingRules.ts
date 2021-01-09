import { PeriodWhereUniqueInput } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

type FindPeriod = PeriodWhereUniqueInput;

export async function assertPeriodExists(params: FindPeriod) {
  const { id, name } = params;

  const period = await prisma.period.findOne({
    where: { id, name },
  });

  if (!period) {
    throw new RequestError('Turno não encontrado');
  }

  return period;
}
