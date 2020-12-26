import prisma from '~/prisma';

export async function updateUserReserveStatus(reserveId: number, userId: number, status: number) {
  const data = await prisma.userReserve.updateMany({
    data: { status },
    where: { reserveId, userId },
  });

  if (data.count === 0) {
    throw new Error('Usuário e/ou Reserva não encotrados');
  }

  return {
    userId,
    reserveId,
    status,
  };
}
