import { Color, Reserve, Room, Schedule } from '@prisma/client';

import { getRandomColorList } from '~/app/utils/colors';

import reserveConfig from '~/config/reserve';

import { UserWithRole } from '~/types/global';

import prisma from '~/prisma';

import { formatUserToResponse } from '../UserController/utils';

interface CreateRelationsBetweenUsersAndReserveParams {
  loggedUserEnrollment: string;
  reserveId: number;
  classmatesEnrollments: string[];
}

interface CreateUserReserveParams {
  reserveId: number;
  colorId: number;
  userEnrollment: string;
  status: number;
}

type UserReserveToFormat = {
  status: number;
  user: UserWithRole;
  color: Color;
};

type ReserveToFormat = {
  id: number;
  name: string | null;
  date: Date;
  adminId: number;
  schedule: Schedule;
  room: Room;
  userReserve: UserReserveToFormat[];
};

export function formatUsersReserveToResponse(userReserve: UserReserveToFormat) {
  const { user, color, status } = userReserve;

  const userToFormat = {
    color,
    ...user,
  };

  return {
    status,
    ...formatUserToResponse(userToFormat),
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
  const { reserveId, userEnrollment, colorId, status } = params;

  const userReserve = await prisma.userReserve.create({
    data: {
      status: status || reserveConfig.userReserve.statusPending,

      user: { connect: { enrollment: userEnrollment } },
      color: { connect: { id: colorId } },
      reserve: { connect: { id: reserveId } },
    },
    include: {
      user: {
        include: { role: true },
      },
      color: true,
    },
  });

  return userReserve;
}

export async function createRelationsBetweenUsersAndReserve(params: CreateRelationsBetweenUsersAndReserveParams) {
  const { loggedUserEnrollment, reserveId, classmatesEnrollments } = params;

  const users = [];
  const userColors = await getRandomColorList(classmatesEnrollments.length);

  for (let i = 0; i < classmatesEnrollments.length; i += 1) {
    const isAdmin = classmatesEnrollments[i] === loggedUserEnrollment;
    const status = isAdmin ? reserveConfig.userReserve.statusAccepted : reserveConfig.userReserve.statusPending;

    const userReserve = await createUserReserve({
      reserveId,
      status,
      colorId: userColors[i].id,
      userEnrollment: classmatesEnrollments[i],
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

export async function updateReserveLeader(reserve: Reserve) {
  const usersReserve = await prisma.userReserve.findMany({
    where: { reserveId: reserve.id },
  });

  await prisma.reserve.update({
    where: { id: reserve.id },
    data: {
      admin: { connect: { id: usersReserve[0].userId } },
    },
  });
}
