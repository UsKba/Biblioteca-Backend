import prisma from '~/prisma';

export async function cleanDatabase() {
  await prisma.userReserve.deleteMany({});
  await prisma.friendRequest.deleteMany({});
  await prisma.friend.deleteMany({});
  await prisma.reserve.deleteMany({});
  await prisma.schedule.deleteMany({});

  await prisma.notice.deleteMany({});

  await prisma.messageTags.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.message.deleteMany({});

  await prisma.user.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.period.deleteMany({});

  // await prisma.userColor.deleteMany({});
}
