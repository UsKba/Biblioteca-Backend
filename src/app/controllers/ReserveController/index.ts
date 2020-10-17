import { Request, Response } from 'express';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { assertRoomIdExists } from '../RoomController/tradingRules';
import { assertIfScheduleExists } from '../ScheduleController/tradingRules';
import {
  assertUserIsOnClassmatesIds,
  assertIfHaveTheMinimunClassmatesRequired,
  assertIfHaveTheMaximumClassmatesRequired,
  assertClassmatesIdsAreDiferent,
  assertRoomIsOpenOnThisDateAndSchedule,
  assertUsersExistsOnDatabase,
  assertIfTheReserveIsNotOnWeekend,
  assertIfTheReserveIsNotBeforeOfToday,
  assertReserveExists,
  assertIsReserveLeader,
} from './tradingRules';
import { createRelationsBetweenUsersAndReserve } from './utils';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  year: number;
  classmatesIDs: number[];
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreReserve>;

class ReserveController {
  async index(request: IndexRequest, response: Response) {
    const userId = request.userId as number; // Quem sou eu e quais reservas estão linkadas a mim

    const reserves = await prisma.reserve.findMany({
      where: {
        UserReserve: { some: { userId } },
      },
      include: {
        Room: true,
        Schedule: true,
        UserReserve: { include: { User: true, Role: true } },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const usersFormatted = reserves.map((reserve) => {
      const users = reserve.UserReserve.map((userReserve) => ({
        ...userReserve.User,
        role: userReserve.Role,
      }));

      const formattedUser = {
        id: reserve.id,
        day: reserve.day,
        month: reserve.month,
        year: reserve.year,
        room: reserve.Room,
        schedule: reserve.Schedule,
        users,
      };

      return formattedUser;
    });

    return response.json(usersFormatted);
  }

  async store(request: StoreRequest, response: Response) {
    const userId = request.userId as number;
    const { roomId, scheduleId, year, month, day, classmatesIDs } = request.body;

    try {
      assertUserIsOnClassmatesIds(userId, classmatesIDs);
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
        Room: { connect: { id: roomId } },
        Schedule: { connect: { id: scheduleId } },
      },
      include: {
        Room: true,
        Schedule: true,
      },
    });

    const reserveUsers = await createRelationsBetweenUsersAndReserve({
      userId,
      classmatesIDs,
      reserveId: reserve.id,
    });

    return response.json({
      id: reserve.id,
      day: reserve.day,
      month: reserve.month,
      year: reserve.year,
      room: reserve.Room,
      schedule: reserve.Schedule,
      users: reserveUsers,
    });
  }

  async delete(req: RequestAuthParamsId, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.id);

    try {
      const reserve = await assertReserveExists(reserveId);
      await assertIsReserveLeader(userId, reserve.UserReserve);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await prisma.userReserve.deleteMany({
      where: {
        Reserve: { id: reserveId },
      },
    });

    await prisma.reserve.delete({
      where: { id: reserveId },
    });

    return res.json({ id: reserveId });
  }
}

export default new ReserveController();
