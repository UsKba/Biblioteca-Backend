import { isBefore } from 'date-fns';

import { haveDuplicates } from '~/app/utils/array';
import { splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

export async function checkUsersExists(classmatesIDs: number[]) {
  for (let i = 0; i < classmatesIDs.length; i += 1) {
    const classmateId = classmatesIDs[i];

    const userExists = await prisma.user.findOne({
      where: { id: classmateId },
    });

    if (!userExists) {
      return false;
    }
  }

  return true;
}

export function assertIdsAreDiferent(classmatesIDs: number[]) {
  const haveIdsDuplicated = haveDuplicates(classmatesIDs);

  if (haveIdsDuplicated) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

export async function assertUsersExistsOnDatabase(classmatesIDs: number[]) {
  const usersExists = await checkUsersExists(classmatesIDs);

  if (!usersExists) {
    throw new Error(`Todos os usuários devem ser cadastrados`);
  }
}

export async function assertIfReserveExists(
  scheduleId: number,
  roomId: number,
  year: number,
  month: number,
  day: number
) {
  const reserveExistsArray = await prisma.reserve.findMany({ where: { scheduleId, roomId, year, month, day } });

  if (reserveExistsArray.length > 0) {
    throw new Error(`Não é possível realizar a reserva pois esta sala já está reservada nesse horário`);
  }
}

export function assertIfHaveEnoughClassmates(classmatesIDs: number[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesIDs.length < minClassmatesPerRoom) {
    throw new Error(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}

export function assertIfTheReserveIsNotOnWeekend(initialHour: string, year: number, month: number, day: number) {
  const [hours, minutes] = splitSingleDate(initialHour);

  const targetDate = new Date(year, month, day, hours, minutes);

  if (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
    throw new Error('Não se pode reservar sala no final de semana');
  }
}

export function assertIfTheReserveIsNotBefore(initialHour: string, year: number, month: number, day: number) {
  const [hours, minutes] = splitSingleDate(initialHour);

  const now = new Date();
  const reserveDate = new Date(year, month, day, hours, minutes);

  if (isBefore(reserveDate, now)) {
    throw new Error('A Data não pode ser anterior a atual');
  }
}
