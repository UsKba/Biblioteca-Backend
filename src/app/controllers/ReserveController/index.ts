import { Request, Response } from 'express';

import { splitSingleDate } from '~/app/utils/date';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

import {
  converDate,
  assertScheduleIsNotBefore,
  assertIfHaveTreeClassmates,
  assertIdsAreDiferent,
  assertIfReserveExists,
  assertUsersExistsOnDatabase,
  assertRoomsExist,
} from './tradingRules';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  year: number;
  classmatesIDs: number[];
}

type StoreRequest = RequestBody<StoreReserve>;

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
