import prisma from '~/prisma';

export async function updateUserReserveStatus(reserveId: number, userId: number, status: number) {
  await prisma.userReserve.updateMany({
    data: { status },
    where: { reserveId, userId },
  });

  return {
    userId,
    reserveId,
    status,
  };
}
