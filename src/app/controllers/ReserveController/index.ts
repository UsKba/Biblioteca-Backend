import { Response } from 'express';

import { setScheduleHoursAndMinutes } from '~/app/utils/date';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { assertRoomIdExists } from '../RoomController/tradingRules';
import { assertIfScheduleExists } from '../ScheduleController/tradingRules';
import {
  assertUserIsOnClassmatesEnrollments,
  assertIfHaveTheMinimunClassmatesRequired,
  assertIfHaveTheMaximumClassmatesRequired,
  assertClassmatesEnrollmentsAreDiferent,
  assertRoomIsOpenOnThisDateAndSchedule,
  assertUsersExistsOnDatabase,
  assertIfTheReserveIsNotOnWeekend,
  assertIfTheReserveIsNotBeforeOfNow,
  assertReserveExists,
  assertIsReserveLeader,
  assertUserIsOnReserve,
} from './tradingRules';
import { createRelationsBetweenUsersAndReserve, formatReserveToResponse } from './utils';

interface StoreReserve {
  name?: string;
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  year: number;
  classmatesEnrollments: string[];
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreReserve>;

class ReserveController {
  async index(request: IndexRequest, response: Response) {
    const userId = request.userId as number;

    const reserves = await prisma.reserve.findMany({
      where: {
        UserReserve: { some: { userId } },
      },
      include: {
        Room: true,
        Schedule: true,
        UserReserve: { include: { User: true } },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const reservesFormatted = reserves.map((reserve) => {
      const users = reserve.UserReserve.map((userReserve) => userReserve.User);

      const formattedReserve = {
        ...formatReserveToResponse(reserve),
        users,
      };

      return formattedReserve;
    });

    return response.json(reservesFormatted);
  }

  async store(request: StoreRequest, response: Response) {
    const userId = request.userId as number;
    const userEnrollment = request.userEnrollment as string;

    const { roomId, scheduleId, year, month, day, classmatesEnrollments, name } = request.body; // ... name = date

    const date = new Date(year, month, day);

    try {
      assertUserIsOnClassmatesEnrollments(userEnrollment, classmatesEnrollments);
      assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments);
      assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments);
      assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments);

      const schedule = await assertIfScheduleExists(scheduleId);
      setScheduleHoursAndMinutes(date, schedule.initialHour);

      assertIfTheReserveIsNotOnWeekend(date);
      assertIfTheReserveIsNotBeforeOfNow(schedule.initialHour, date);

      await assertRoomIdExists(roomId);
      await assertRoomIsOpenOnThisDateAndSchedule(scheduleId, roomId, date);
      await assertUsersExistsOnDatabase(classmatesEnrollments);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const reserve = await prisma.reserve.create({
      data: {
        name,
        date,
        Admin: { connect: { id: userId } },
        Room: { connect: { id: roomId } },
        Schedule: { connect: { id: scheduleId } },
      },
      include: {
        Room: true,
        Schedule: true,
      },
    });

    const reserveUsers = await createRelationsBetweenUsersAndReserve({
      classmatesEnrollments,
      reserveId: reserve.id,
    });

    const reserveFormatted = {
      ...formatReserveToResponse(reserve),
      users: reserveUsers,
    };

    return response.json(reserveFormatted);
  }

  async delete(req: RequestAuthParamsId, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.id);

    try {
      const reserve = await assertReserveExists(reserveId);

      assertUserIsOnReserve(userId, reserve.UserReserve);

      await assertIsReserveLeader(userId, reserve);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await prisma.userReserve.deleteMany({
      where: { reserveId },
    });

    await prisma.reserve.delete({
      where: { id: reserveId },
    });

    return res.json({ id: reserveId });
  }
}

export default new ReserveController();
