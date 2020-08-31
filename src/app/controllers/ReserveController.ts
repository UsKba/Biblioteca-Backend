import { Request, Response } from 'express';

import { isBefore } from 'date-fns';

import reserveConfig from '~/config/reserve';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

import { splitSingleDate } from '../utils/date';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  year: number;
  classmatesIDs: number[];
}

type StoreRequest = RequestBody<StoreReserve>;

function converDate(year: number, month: number, day: number, hours: number, minutes: number) {
  // const targetMonth = month - 1; // Jan is month 0

  const targetDate = new Date(year, month, day, hours, minutes, 0, 0);

  return targetDate;
}

function assertScheduleIsNotBefore(year: number, month: number, day: number, hours: number, minutes: number) {
  const now = new Date();
  const reserveDate = converDate(year, month, day, hours, minutes);

  const isDateBefore = isBefore(reserveDate, now);

  return isDateBefore;
}

function assertUniqueIds(classmatesIDs: number[]) {
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

async function assertUsersExists(classmatesIDs: number[]) {
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

function assertIdsAreDiferent(classmatesIDs: number[]) {
  const isIdsUnique = assertUniqueIds(classmatesIDs);

  if (!isIdsUnique) {
    throw new Error('Não pode repetir o mesmo usuário');
  }
}

async function assertUsersExistsOnDatabase(classmatesIDs: number[]) {
  const usersExists = await assertUsersExists(classmatesIDs);

  if (!usersExists) {
    throw new Error(`Todos os usuários devem ser cadastrados`);
  }
}

async function assertRoomsExist(roomId: number) {
  const roomExists = await prisma.room.findOne({
    where: { id: roomId },
  });

  if (!roomExists) {
    throw new Error(`Sala não encontrada`);
  }
}

async function assertIfReserveExists(scheduleId: number, roomId: number, year: number, month: number, day: number) {
  const reserveExistsArray = await prisma.reserve.findMany({ where: { scheduleId, roomId, year, month, day } });

  if (reserveExistsArray.length > 0) {
    throw new Error(`Não é possível realizar a reserva pois esta sala já está reservada nesse horário`);
  }
}

function assertIfHaveTreeClassmates(classmatesIDs: number[]) {
  const { minClassmatesPerRoom } = reserveConfig;

  if (classmatesIDs.length < minClassmatesPerRoom) {
    throw new Error(`São necessários ao menos ${minClassmatesPerRoom} alunos`);
  }
}

class ReserveController {
  async index(request: Request, response: Response) {
    const reserve = await prisma.reserve.findMany({});
    return response.json(reserve);
  }

  async store(request: StoreRequest, response: Response) {
    const { roomId, scheduleId, year, month, day, classmatesIDs } = request.body;

    // teste de horário

    const schedule = await prisma.schedule.findOne({ where: { id: scheduleId } });

    if (!schedule) {
      return response.status(400).json({ error: 'Horário não existe' });
    }

    // teste de final de semana

    const [hours, minutes] = splitSingleDate(schedule.initialHour);

    const targetDate = converDate(year, month, day, hours, minutes);

    if (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
      return response.status(400).json({ error: 'Não se pode reservar sala no final de semana' });
    }

    // teste dia anterior

    const isDateBefore = assertScheduleIsNotBefore(year, month, day, hours, minutes);

    if (isDateBefore) {
      return response.status(400).json({ error: 'A Data não pode ser anterior a atual' });
    }

    try {
      assertIfHaveTreeClassmates(classmatesIDs);
      assertIdsAreDiferent(classmatesIDs);
      await assertIfReserveExists(scheduleId, roomId, year, month, day);
      await assertUsersExistsOnDatabase(classmatesIDs);
      await assertRoomsExist(roomId);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const reserve = await prisma.reserve.create({
      data: {
        year,
        month,
        day,
        room: { connect: { id: roomId } },
        schedule: { connect: { id: scheduleId } },
      },
    });

    for (let i = 0; i < classmatesIDs.length; i += 1) {
      await prisma.userReserve.create({
        data: {
          reserve: { connect: { id: reserve.id } },
          user: { connect: { id: classmatesIDs[i] } },
        },
      });
    }

    return response.json(reserve);
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.reserve.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new ReserveController();
