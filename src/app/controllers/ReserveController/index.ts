import { Request, Response } from 'express';

import { User } from '@prisma/client';

import { RequestBody } from '~/types';
import { RequestAuth } from '~/types/auth';

import prisma from '~/prisma';

import { assertRoomIdExists } from '../RoomController/tradingRules';
import { assertIfScheduleExists } from '../ScheduleController/tradingRules';
import {
  assertIfHaveTheMinimunClassmatesRequired,
  assertIfHaveTheMaximumClassmatesRequired,
  assertClassmatesIdsAreDiferent,
  assertRoomIsOpenOnThisDateAndSchedule,
  assertUsersExistsOnDatabase,
  assertIfTheReserveIsNotOnWeekend,
  assertIfTheReserveIsNotBeforeOfToday,
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
      assertIfHaveTheMinimunClassmatesRequired(classmatesIDs);
      assertIfHaveTheMaximumClassmatesRequired(classmatesIDs);
      assertClassmatesIdsAreDiferent(classmatesIDs);

      const schedule = await assertIfScheduleExists(scheduleId);

      assertIfTheReserveIsNotOnWeekend(schedule.initialHour, year, month, day);
      assertIfTheReserveIsNotBeforeOfToday(schedule.initialHour, year, month, day);

      await assertRoomIdExists(roomId);
      await assertRoomIsOpenOnThisDateAndSchedule(scheduleId, roomId, year, month, day);
      await assertUsersExistsOnDatabase(classmatesIDs);
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
      include: {
        room: true,
        schedule: true,
      },
    });

    const users = [] as User[];

    for (let i = 0; i < classmatesIDs.length; i += 1) {
      const userReserve = await prisma.userReserve.create({
        data: {
          reserve: { connect: { id: reserve.id } },
          user: { connect: { id: classmatesIDs[i] } },
        },
        include: {
          user: true,
        },
      });

      users.push(userReserve.user);
    }

    return response.json({
      id: reserve.id,
      day: reserve.day,
      month: reserve.month,
      year: reserve.year,
      room: reserve.room,
      schedule: reserve.schedule,
      users,
    });
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.reserve.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new ReserveController();
