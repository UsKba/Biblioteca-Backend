import { Reserve, Room, Schedule, User, UserReserve } from '@prisma/client';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

interface CreateRelationsBetweenUsersAndReserveParams {
  loggedUserEnrollment: string;
  reserveId: number;
  classmatesEnrollments: string[];
}

interface CreateUserReserveParams {
  reserveId: number;
  userEnrollment: string;
  status?: number;
}

type ReserveToFormat = {
  id: number;
  name: string | null;
  date: Date;
  adminId: number;
  schedule: Schedule;
  room: Room;
  userReserve: { status: number; user: User }[];
};

type UserReserveToFormat = {
  status: number;
  user: User;
};

export function formatUsersReserveToResponse(userReserve: UserReserveToFormat) {
  return {
    status: userReserve.status,
    ...userReserve.user,
  };
}

export function formatReserveToResponse(reserve: ReserveToFormat) {
  const users = reserve.userReserve.map(formatUsersReserveToResponse);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { userReserve, ...rest } = reserve;

  const formattedReserve = {
    ...rest,
    users,
  };

  return formattedReserve;
}

export function formatReservesToResponse(reserves: ReserveToFormat[]) {
  const reservesFormatted = reserves.map(formatReserveToResponse);

  return reservesFormatted;
}

export async function createUserReserve(params: CreateUserReserveParams) {
  const { reserveId, userEnrollment, status } = params;

  const userReserve = await prisma.userReserve.create({
    data: {
      status: status || reserveConfig.userReserve.statusPending,

      reserve: { connect: { id: reserveId } },
      user: { connect: { enrollment: userEnrollment } },
    },
    include: {
      user: true,
    },
  });

  return userReserve;
}

export async function createRelationsBetweenUsersAndReserve(params: CreateRelationsBetweenUsersAndReserveParams) {
  const { loggedUserEnrollment, reserveId, classmatesEnrollments } = params;

  const users = [];

  for (let i = 0; i < classmatesEnrollments.length; i += 1) {
    const isAdmin = classmatesEnrollments[i] === loggedUserEnrollment;
    const status = isAdmin ? reserveConfig.userReserve.statusAccepted : undefined;

    const userReserve = await createUserReserve({
      userEnrollment: classmatesEnrollments[i],
      reserveId,
      status,
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
