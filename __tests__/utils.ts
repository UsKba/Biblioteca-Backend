import prisma from '~/prisma';

export async function cleanDatabase() {
  await prisma.userReserves.deleteMany({});
  await prisma.invites.deleteMany({});
  await prisma.friends.deleteMany({});
  await prisma.reserves.deleteMany({});
  await prisma.schedules.deleteMany({});

  await prisma.users.deleteMany({});
  await prisma.rooms.deleteMany({});
  await prisma.periods.deleteMany({});
}
