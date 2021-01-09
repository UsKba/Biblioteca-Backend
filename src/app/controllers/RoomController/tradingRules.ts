import { RequestError } from '~/app/errors/request';

import roomConfig from '~/config/room';

import prisma from '~/prisma';

interface RoomNotExistsParams {
  initials?: string;
}

interface RoomExistsParams {
  id?: number;
}

export async function assertRoomNotExists(params: RoomNotExistsParams) {
  const { initials } = params;

  const room = await prisma.room.findOne({
    where: { initials },
  });

  if (room !== null) {
    throw new RequestError(`${initials} já existe`);
  }

  return room;
}

export async function assertRoomExists(params: RoomExistsParams) {
  const { id } = params;

  const room = await prisma.room.findOne({
    where: { id },
  });

  if (!room) {
    throw new RequestError('Sala não encontrada');
  }

  return room;
}

export function assertIsValidRoomStatus(status: number) {
  const validStatus = Object.values(roomConfig);
  const statusExists = validStatus.find((currentStatus) => currentStatus === status);

  if (!statusExists) {
    throw new RequestError(`'Status' inválido`);
  }
}
