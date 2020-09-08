import prisma from '~/prisma';

export async function assertInitialsNotExists(initials: string) {
  const room = await prisma.room.findOne({
    where: { initials },
  });

  if (room !== null) {
    throw new Error('Já existe sala com essa sigla');
  }
}

export async function assertRoomIdExists(id: number) {
  const roomExists = await prisma.room.findOne({ where: { id: Number(id) } });

  if (!roomExists) {
    throw new Error('Sala não encontrada');
  }
}
