import { Reserve, Room, Schedule, User, UserReserve } from '@prisma/client';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

interface CreateRelationsBetweenUsersAndReserveParams {
  reserveId: number;
  classmatesEnrollments: string[];
}

interface CreateUserReserveParams {
  reserveId: number;
  userEnrollment: string;
}

type ReserveToFormat = Reserve & {
  Schedule: Schedule;
  Room: Room;
};

type UserReserveToFormat = UserReserve & {
  User: User;
};

export function formatUsersReserveToResponse(userReserve: UserReserveToFormat) {
  return {
    status: userReserve.status,
    ...userReserve.User,
  };
}

export function formatReserveToResponse(reserve: ReserveToFormat) {
  return {
    id: reserve.id,
    name: reserve.name,
    date: reserve.date,
    adminId: reserve.adminId,
    room: reserve.Room,
    schedule: reserve.Schedule,
  };
}

export async function createUserReserve(params: CreateUserReserveParams) {
  const { reserveId, userEnrollment } = params;

  const userReserve = await prisma.userReserve.create({
    data: {
      status: reserveConfig.userReserve.statusWaiting,

      Reserve: { connect: { id: reserveId } },
      User: { connect: { enrollment: userEnrollment } },
    },
    include: {
      User: true,
    },
  });

  return userReserve;
}

export async function createRelationsBetweenUsersAndReserve(params: CreateRelationsBetweenUsersAndReserveParams) {
  const { reserveId, classmatesEnrollments } = params;

  const users = [];

  for (let i = 0; i < classmatesEnrollments.length; i += 1) {
    const userReserve = await createUserReserve({
      userEnrollment: classmatesEnrollments[i],
      reserveId,
    });

    const userFormatted = formatUsersReserveToResponse(userReserve);
    users.push(userFormatted);
  }

  return users;
}

export async function deleteReserve(reserveId: number) {
  await prisma.userReserve.deleteMany({
    where: { reserveId },
  });

  await prisma.reserve.delete({
    where: { id: reserveId },
  });
}
