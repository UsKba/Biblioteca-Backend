import { User } from '@prisma/client';

import { splitSingleDate } from '~/app/utils/date';

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
}


export function setScheduleHoursAndMinutes(date: Date, scheduleHours: string) {
  const [hours, minutes] = splitSingleDate(scheduleHours);
  date.setHours(hours, minutes);
}

export async function createUserReserve(params: CreateUserReserveParams) {
  const { reserveId, userId} = params;

  const userReserve = await prisma.userReserve.create({
    data: {
      Reserve: { connect: { id: reserveId } },
      User: { connect: { id: userId } },
    },
    include: {
      User: true,
    },
  });

  return userReserve;
}

export async function createRelationsBetweenMembersAndReserve(membersIds: number[], reserveId: number) {
  const members = [] as User[];

  for (let i = 0; i < membersIds.length; i += 1) {
    const userReserve = await createUserReserve({
      userId: membersIds[i],
      reserveId,
    });

    members.push({
      ...userReserve.User
    });
  }

  return members;
}

export async function createRelationBetweenGroupLeaderAndReserve(userId: number, reserveId: number) {
  const userReserve = await createUserReserve({
    userId,
    reserveId,
  });

  return {
    ...userReserve.User
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
