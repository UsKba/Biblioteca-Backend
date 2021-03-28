import prisma from '~/prisma';

import { assertComputerExists, assertIsValidComputerStatus } from './tradingRules';

interface Update {
  id: number;
  identification?: string;
  status?: number;
  localId?: number;
}

export async function updateComputer(data: Update) {
  const { id, identification, status, localId } = data;

  const computer = await assertComputerExists({ id });

  if (status) {
    assertIsValidComputerStatus(status);
  }

  const computerUpdated = await prisma.computer.update({
    data: {
      identification,
      status,
      local: { connect: { id: localId || computer.localId } },
    },
    where: { id },
    include: {
      local: true,
    },
  });

  return computerUpdated;
}
