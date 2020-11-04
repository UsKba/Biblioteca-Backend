import { UserReserve } from '@prisma/client';
import { isBefore } from 'date-fns';

import { haveDuplicates } from '~/app/utils/array';
import { splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

async function checkUsersExists(userIds: number[]) {
  for (let i = 0; i < userIds.length; i += 1) {
    const userId = userIds[i];

    const userExists = await prisma.user.findOne({
      where: { id: userId },
    });

    if (!userExists) {
      return {
        allUsersExists: false,
        nonUserId: userId,
      };
    }
  }

  return { allUsersExists: true };
}

export async function assertUsersExistsOnDatabase(userIds: number[]) {
  const { allUsersExists, nonUserId } = await checkUsersExists(userIds);

  if (!allUsersExists) {
    throw new Error(`Usuário ${nonUserId} não encontrado`);
  }
}

export async function assertRoomIsOpenOnThisDateAndSchedule(scheduleId: number, roomId: number, date: Date) {
  const reserveExistsArray = await prisma.reserve.findMany({
    where: { scheduleId, roomId, date },
  });

  if (reserveExistsArray.length > 0) {
    throw new Error(`Não é possível realizar a reserva pois esta sala já está reservada nesse dia e horário`);
  }
}

export function assertIfHaveTheMinimunClassmatesRequired(classmatesIDs: number[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesIDs.length < minClassmatesPerRoom) {
    throw new Error(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}

export function assertIfHaveTheMaximumClassmatesRequired(classmatesIDs: number[]) {
  const { maxClassmatesPerRoom } = reserveConfig;

  if (classmatesIDs.length > maxClassmatesPerRoom) {
    throw new Error(`São necessários no máximo ${maxClassmatesPerRoom} alunos`);
  }
}

export function assertUserIsOnClassmatesIds(userId: number, classmatesIDs: number[]) {
  const userExists = classmatesIDs.includes(userId);

  if (!userExists) {
    throw new Error('Somente o usuario autenticado pode realizar a reserva');
  }
}

export function assertClassmatesIdsAreDiferent(classmatesIDs: number[]) {
  const haveIdsDuplicated = haveDuplicates(classmatesIDs);

  if (haveIdsDuplicated) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

export function assertIfTheReserveIsNotOnWeekend(date: Date) {
  if (date.getDay() === 0 || date.getDay() === 6) {
    throw new Error('Não se pode reservar sala no final de semana');
  }
}

export function assertIfTheReserveIsNotBeforeOfNow(initialHour: string, date: Date) {
  const now = new Date();

  if (isBefore(date, now)) {
    throw new Error('A Data não pode ser anterior a atual');
  }
}

export async function assertReserveExists(id: number) {
  const reserve = await prisma.reserve.findOne({
    where: { id },
    include: {
      UserReserve: true,
    },
  });

  if (!reserve) {
    throw new Error('Reserva não encontrada');
  }

  return reserve;
}

export async function checkIsReserveLeader(userId: number, userReserves: UserReserve[]) {
  const [adminRole] = await prisma.role.findMany({
    where: { slug: reserveConfig.leaderSlug },
  });

  const reserveUser = userReserves.find((userReserve) => userReserve.userId === userId);

  return reserveUser?.roleId === adminRole.id;
}

export async function assertIsReserveLeader(userId: number, userReserves: UserReserve[]) {
  const isReserveLeader = await checkIsReserveLeader(userId, userReserves);

  if (!isReserveLeader) {
    throw new Error('Somente o líder da reserva pode realizar esta ação');
  }
}

export function assertUserIsOnReserve(userId: number, userReserves: UserReserve[]) {
  const userExists = userReserves.find((userReserve) => userReserve.userId === userId);

  if (!userExists) {
    throw new Error('Você não está na reserva');
  }
}

export function assertCanRemoveUserFromReserve(userReserves: UserReserve[]) {
  if (userReserves.length - 1 < reserveConfig.minClassmatesPerRoom) {
    throw new Error(`Precisa-se ter no mínimo ${reserveConfig.minClassmatesPerRoom} componentes na reserva`);
  }
}
