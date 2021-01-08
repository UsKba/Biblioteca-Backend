import { Reserve, UserReserve } from '@prisma/client';
import { isBefore } from 'date-fns';

import { haveDuplicates } from '~/app/utils/array';
import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

export async function assertRoomIsOpenOnThisDateAndSchedule(scheduleId: number, roomId: number, date: Date) {
  const reserveExistsArray = await prisma.reserve.findMany({
    where: { scheduleId, roomId, date },
  });

  if (reserveExistsArray.length > 0) {
    throw new RequestError(`Não é possível realizar a reserva pois esta sala já está reservada nesse dia e horário`);
  }
}

export function assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments: string[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesEnrollments.length < minClassmatesPerRoom) {
    throw new RequestError(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}

export function assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments: string[]) {
  const { maxClassmatesPerRoom } = reserveConfig;

  if (classmatesEnrollments.length > maxClassmatesPerRoom) {
    throw new RequestError(`São necessários no máximo ${maxClassmatesPerRoom} alunos`);
  }
}

export function assertUserIsOnClassmatesEnrollments(userEnrollment: string, classmatesEnrollments: string[]) {
  const userExists = classmatesEnrollments.includes(userEnrollment);

  if (!userExists) {
    throw new RequestError('Somente o usuario autenticado pode realizar a reserva');
  }
}

export function assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments: string[]) {
  const haveIdsDuplicated = haveDuplicates(classmatesEnrollments);

  if (haveIdsDuplicated) {
    throw new RequestError('Não pode repetir o mesmo usuário');
  }
}

export function assertIfTheReserveIsNotOnWeekend(date: Date) {
  if (date.getDay() === 0 || date.getDay() === 6) {
    throw new RequestError('Não se pode reservar sala no final de semana');
  }
}

export function assertIfTheReserveIsNotBeforeOfNow(date: Date) {
  const now = new Date();
  const dateOnBrazilTimezone = getDateOnBrazilTimezone(now);

  if (isBefore(date, dateOnBrazilTimezone)) {
    throw new RequestError('A data não pode ser anterior a atual');
  }
}

export async function assertReserveExists(id: number) {
  const reserve = await prisma.reserve.findOne({
    where: { id },
    include: {
      userReserve: true,
    },
  });

  if (!reserve) {
    throw new RequestError('Reserva não encontrada');
  }

  return reserve;
}

export async function assertIsReserveLeader(userId: number, reserve: Reserve) {
  if (reserve.adminId !== userId) {
    throw new RequestError('Somente o líder da reserva pode realizar esta ação');
  }
}

export function assertUserIsOnReserve(userId: number, userReserves: UserReserve[]) {
  const userExists = userReserves.find((userReserve) => userReserve.userId === userId);

  if (!userExists) {
    throw new RequestError('Usuário não pertence a reserva');
  }
}

export function checkHaveExactMinUsersOnReserve(userReserves: UserReserve[]) {
  // if (userReserves.length === reserveConfig.minClassmatesPerRoom) {
  // if (userReserves.length >= reserveConfig.minClassmatesPerRoom) {
  return userReserves.length === reserveConfig.minClassmatesPerRoom;
}
