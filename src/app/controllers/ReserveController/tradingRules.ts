import { isBefore } from 'date-fns';

import reserveConfig from '~/config/reserve';

import prisma from '~/prisma';

export function converDate(year: number, month: number, day: number, hours: number, minutes: number) {
  // const targetMonth = month - 1; // Jan is month 0

  const targetDate = new Date(year, month, day, hours, minutes, 0, 0);

  return targetDate;
}

export function assertScheduleIsNotBefore(year: number, month: number, day: number, hours: number, minutes: number) {
  const now = new Date();
  const reserveDate = converDate(year, month, day, hours, minutes);

  const isDateBefore = isBefore(reserveDate, now);

  return isDateBefore;
}

export function assertUniqueIds(classmatesIDs: number[]) {
  const iDs = [] as number[];

  for (let i = 0; i < classmatesIDs.length; i += 1) {
    const idExists = iDs.findIndex((element) => element === classmatesIDs[i]);

    if (idExists !== -1) {
      // existe em Ids

      return false;
    }

    iDs.push(classmatesIDs[i]);
  }

  return true;
}

export async function assertUsersExists(classmatesIDs: number[]) {
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
  const isIdsUnique = assertUniqueIds(classmatesIDs);

  if (!isIdsUnique) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

export async function assertUsersExistsOnDatabase(classmatesIDs: number[]) {
  const usersExists = await assertUsersExists(classmatesIDs);

  if (!usersExists) {
    throw new Error(`Todos os usuários devem ser cadastrados`);
  }
}

export async function assertRoomsExist(roomId: number) {
  const roomExists = await prisma.room.findOne({
    where: { id: roomId },
  });

  if (!roomExists) {
    throw new Error(`Sala não encontrada`);
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

export function assertIfHaveTreeClassmates(classmatesIDs: number[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesIDs.length < minClassmatesPerRoom) {
    throw new Error(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}
