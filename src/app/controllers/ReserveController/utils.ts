import { User } from '@prisma/client';

import { splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

interface CreateRelationsBetweenUsersAndReserveParams {
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

export async function createRelationsBetweenUsersAndReserve(params: CreateRelationsBetweenUsersAndReserveParams) {

  const { reserveId, classmatesIDs } = params;

  const users = [] as User[];

  for (let i = 0; i < classmatesIDs.length; i += 1) {
    const userReserve = await createUserReserve({
      userId: classmatesIDs[i],
      reserveId,
    });

    users.push({
      ...userReserve.User
    });
  }

  return users;
}
