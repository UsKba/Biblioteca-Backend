import prisma from '~/prisma';

export async function cleanDatabase() {
  await prisma.userReserve.deleteMany({});
  await prisma.invite.deleteMany({});
  await prisma.friend.deleteMany({});
  await prisma.reserve.deleteMany({});
  await prisma.schedule.deleteMany({});

  await prisma.user.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.period.deleteMany({});
}
