// import reserveConfig from '~/config/reserve';

// import prisma from '~/prisma';

// export async function promoteMemberToLeaderOnReserve(reserveId: number, userId: number) {
//   const [adminRole] = await prisma.role.findMany({
//     where: { slug: reserveConfig.leaderSlug },
//   });

//   await prisma.userReserve.update({
//     data: {
//       Role: { connect: { id: adminRole.id } },
//     },
//     where: {},
//   });
// }
