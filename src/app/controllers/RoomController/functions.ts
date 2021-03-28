import prisma from '~/prisma';

import { assertIsValidRoomStatus, assertRoomExists, assertRoomNotExists } from './tradingRules';

interface Update {
  id: number;
  initials?: string;
  status?: number;
}

export async function updateRoom(data: Update) {
  const { id, status, initials } = data;

  await assertRoomExists({ id });

  if (status) {
    assertIsValidRoomStatus(status);
  }

  if (initials) {
    await assertRoomNotExists({ initials });
  }

  const room = await prisma.room.update({
    where: { id },
    data: {
      status,
      initials,
    },
  });

  return room;
}
