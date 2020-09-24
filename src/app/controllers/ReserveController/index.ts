import { Request, Response } from 'express';

import { RequestBody } from '~/types';
import { RequestAuth } from '~/types/auth';

import prisma from '~/prisma';

import { assertRoomIdExists } from '../RoomController/tradingRules';
import { assertIfScheduleExists } from '../ScheduleController/tradingRules';
import {
  assertIfHaveEnoughClassmates,
  assertIdsAreDiferent,
  assertIfReserveExists,
  assertUsersExistsOnDatabase,
  assertIfTheReserveIsNotOnWeekend,
  assertIfTheReserveIsNotBefore,
} from './tradingRules';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  year: number;
  classmatesIDs: number[];
}
type IndexRequest = RequestAuth;
type StoreRequest = RequestBody<StoreReserve>;

class ReserveController {
  async index(request: IndexRequest, response: Response) {
    const userId = request.userId as number; // Quem sou eu e quais reservas estão linkadas a mim

    const reserves = await prisma.reserve.findMany({
      where: {
        UserReserve: { some: { userId } },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return response.json(reserves);
  }

  async store(request: StoreRequest, response: Response) {
    const { roomId, scheduleId, year, month, day, classmatesIDs } = request.body;

    try {
      const schedule = await assertIfScheduleExists(scheduleId);

      assertIfTheReserveIsNotOnWeekend(schedule.initialHour, year, month, day);
      assertIfTheReserveIsNotBefore(schedule.initialHour, year, month, day);
      assertIfHaveEnoughClassmates(classmatesIDs);
      assertIdsAreDiferent(classmatesIDs);

      await assertIfReserveExists(scheduleId, roomId, year, month, day);
      await assertUsersExistsOnDatabase(classmatesIDs);
      await assertRoomIdExists(roomId);
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
