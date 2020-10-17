import { Role, User } from '@prisma/client';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

interface CreateRelationsBetweenUsersAndReserveParams {
  userId: number;
  reserveId: number;
  classmatesIDs: number[];
}

interface CreateUserReserveParams {
  reserveId: number;
  userId: number;
  roleId: number;
}

interface UserFormatted extends User {
  role: Role;
}

export async function createUserReserve(params: CreateUserReserveParams) {
  const { reserveId, userId, roleId } = params;

  const userReserve = await prisma.userReserve.create({
    data: {
      Reserve: { connect: { id: reserveId } },
      User: { connect: { id: userId } },
      Role: { connect: { id: roleId } },
    },
    include: {
      User: true,
      Role: true,
    },
  });

  return userReserve;
}

export async function createRelationsBetweenMembersAndReserve(membersIds: number[], reserveId: number) {
  const [memberRole] = await prisma.role.findMany({
    where: { slug: reserveConfig.memberSlug },
  });

  const members = [] as UserFormatted[];

  for (let i = 0; i < membersIds.length; i += 1) {
    const userReserve = await createUserReserve({
      userId: membersIds[i],
      reserveId,
      roleId: memberRole.id,
    });

    members.push({
      ...userReserve.User,
      role: userReserve.Role,
    });
  }

  return members;
}

export async function createRelationBetweenGroupLeaderAndReserve(userId: number, reserveId: number) {
  const [adminRole] = await prisma.role.findMany({
    where: { slug: reserveConfig.leaderSlug },
  });

  const userReserve = await createUserReserve({
    userId,
    reserveId,
    roleId: adminRole.id,
  });

  return {
    ...userReserve.User,
    role: userReserve.Role,
  };
}

export async function createRelationsBetweenUsersAndReserve(params: CreateRelationsBetweenUsersAndReserveParams) {
  const { userId, reserveId, classmatesIDs } = params;

  const membersIds = classmatesIDs.filter((classmateId) => classmateId !== userId);

  const reserveLeader = await createRelationBetweenGroupLeaderAndReserve(userId, reserveId);
  const reserveMembers = await createRelationsBetweenMembersAndReserve(membersIds, reserveId);

  const users = [reserveLeader, ...reserveMembers];

  return users;
}
