import { Reserve, UserReserve } from '@prisma/client';
import { isBefore } from 'date-fns';

import { haveDuplicates } from '~/app/utils/array';
import { removeDateTimezoneOffset } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

async function checkUsersExists(userEnrollments: string[]) {
  for (let i = 0; i < userEnrollments.length; i += 1) {
    const userEnrollment = userEnrollments[i];

    const userExists = await prisma.user.findOne({
      where: { enrollment: userEnrollment },
    });

    if (!userExists) {
      return {
        allUsersExists: false,
        nonUserEnrollment: userEnrollment,
      };
    }
  }

  return { allUsersExists: true };
}

export async function assertUsersExistsOnDatabase(usersEnrollments: string[]) {
  const { allUsersExists, nonUserEnrollment } = await checkUsersExists(usersEnrollments);

  if (!allUsersExists) {
    throw new Error(`Usuário ${nonUserEnrollment} não encontrado`);
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

export function assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments: string[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesEnrollments.length < minClassmatesPerRoom) {
    throw new Error(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}

export function assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments: string[]) {
  const { maxClassmatesPerRoom } = reserveConfig;

  if (classmatesEnrollments.length > maxClassmatesPerRoom) {
    throw new Error(`São necessários no máximo ${maxClassmatesPerRoom} alunos`);
  }
}

export function assertUserIsOnClassmatesEnrollments(userEnrollment: string, classmatesEnrollments: string[]) {
  const userExists = classmatesEnrollments.includes(userEnrollment);

  if (!userExists) {
    throw new Error('Somente o usuario autenticado pode realizar a reserva');
  }
}

export function assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments: string[]) {
  const haveIdsDuplicated = haveDuplicates(classmatesEnrollments);

  if (haveIdsDuplicated) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

export function assertIfTheReserveIsNotOnWeekend(date: Date) {
  if (date.getDay() === 0 || date.getDay() === 6) {
    throw new Error('Não se pode reservar sala no final de semana');
  }
}

export function assertIfTheReserveIsNotBeforeOfNow(date: Date) {
  const now = new Date();
  const nowWithoutTimezone = removeDateTimezoneOffset(now);

  if (isBefore(date, nowWithoutTimezone)) {
    throw new Error('A Data não pode ser anterior a atual');
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
    throw new Error('Reserva não encontrada');
  }

  return reserve;
}

export async function assertIsReserveLeader(userId: number, reserve: Reserve) {
  if (reserve.adminId !== userId) {
    throw new Error('Somente o líder da reserva pode realizar esta ação');
  }
}

export async function assertIfUserIsHisSelf(userId: number, userToDelete: number) {
  if (userToDelete !== userId) {
    throw new Error('Somente o lider da reserva pode remover outros usuários da reserva');
  }
}

export async function uptateReserveLeader(reserve: Reserve) {
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

export function assertUserIsOnReserve(userId: number, userReserves: UserReserve[]) {
  const userExists = userReserves.find((userReserve) => userReserve.userId === userId);

  if (!userExists) {
    throw new Error('Usuário não pertence a reserva');
  }
}

// export function assertCanRemoveUserFromReserve(userReserves: UserReserve[]) {
//   if (userReserves.length - 1 < reserveConfig.minClassmatesPerRoom) {
//     throw new Error(`Precisa-se ter no mínimo ${reserveConfig.minClassmatesPerRoom} componentes na reserva`);
//   }
// }

export function checkIfHaveMinUsersOnReserve(userReserves: UserReserve[]) {
  if (userReserves.length === reserveConfig.minClassmatesPerRoom) {
    return true;
  }
  return false;
}
