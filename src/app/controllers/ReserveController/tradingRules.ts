import { isBefore } from 'date-fns';

import { haveDuplicates } from '~/app/utils/array';
import { splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

async function checkUsersExists(userIds: number[]) {
  for (let i = 0; i < userIds.length; i += 1) {
    const userId = userIds[i];

    const userExists = await prisma.users.findOne({
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

export async function assertIfReserveExists(
  scheduleId: number,
  roomId: number,
  year: number,
  month: number,
  day: number
) {
  const reserveExistsArray = await prisma.reserves.findMany({ where: { scheduleId, roomId, year, month, day } });

  if (reserveExistsArray.length > 0) {
    throw new Error(`Não é possível realizar a reserva pois esta sala já está reservada nesse horário`);
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

export function assertClassmatesIdsAreDiferent(classmatesIDs: number[]) {
  const haveIdsDuplicated = haveDuplicates(classmatesIDs);

  if (haveIdsDuplicated) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

export function assertIfTheReserveIsNotOnWeekend(initialHour: string, year: number, month: number, day: number) {
  const [hours, minutes] = splitSingleDate(initialHour);

  const targetDate = new Date(year, month, day, hours, minutes);

  if (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
    throw new Error('Não se pode reservar sala no final de semana');
  }
}

export function assertIfTheReserveIsNotBeforeOfToday(initialHour: string, year: number, month: number, day: number) {
  const [hours, minutes] = splitSingleDate(initialHour);

  const now = new Date();
  const reserveDate = new Date(year, month, day, hours, minutes);

  if (isBefore(reserveDate, now)) {
    throw new Error('A Data não pode ser anterior a atual');
  }
}
