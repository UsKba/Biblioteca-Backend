import { Response } from 'express';

import { setScheduleHoursAndMinutesAndRemoveTimezone, removeDateTimezoneOffset } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

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
import {
  createRelationsBetweenUsersAndReserve,
  deleteReserve,
  formatReserveToResponse,
  formatReservesToResponse,
} from './utils';

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
    const startDateWithoutTimezone = removeDateTimezoneOffset(new Date());

    const reserves = await prisma.reserve.findMany({
      where: {
        userReserve: {
          some: {
            userId,
            NOT: { status: reserveConfig.userReserve.statusRefused },
          },
        },
        date: {
          gte: startDateWithoutTimezone,
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        adminId: true,
        room: true,
        schedule: true,
        userReserve: {
          select: { status: true, user: true },
          where: {
            NOT: { status: reserveConfig.userReserve.statusRefused },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const reservesFormatted = formatReservesToResponse(reserves);

    return response.json(reservesFormatted);
  }

  async store(request: StoreRequest, response: Response) {
    const userId = request.userId as number;
    const userEnrollment = request.userEnrollment as string;

    const { roomId, scheduleId, year, month, day, classmatesEnrollments, name } = request.body; // ... name = date

    const date = new Date(year, month, day);
    let dateWithoutTimezone: Date;

    try {
      assertUserIsOnClassmatesEnrollments(userEnrollment, classmatesEnrollments);
      assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments);
      assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments);
      assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments);

      const schedule = await assertIfScheduleExists(scheduleId);
      dateWithoutTimezone = setScheduleHoursAndMinutesAndRemoveTimezone(date, schedule.initialHour);

      assertIfTheReserveIsNotOnWeekend(dateWithoutTimezone);
      assertIfTheReserveIsNotBeforeOfNow(dateWithoutTimezone);

      await assertRoomIdExists(roomId);
      await assertRoomIsOpenOnThisDateAndSchedule(scheduleId, roomId, dateWithoutTimezone);
      await assertUsersExistsOnDatabase(classmatesEnrollments);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const reserve = await prisma.reserve.create({
      data: {
        name,
        date: dateWithoutTimezone,
        admin: { connect: { id: userId } },
        room: { connect: { id: roomId } },
        schedule: { connect: { id: scheduleId } },
      },
      select: {
        id: true,
        name: true,
        date: true,
        adminId: true,
        room: true,
        schedule: true,
        userReserve: {
          select: { status: true, user: true },
        },
      },
    });

    const reserveUsers = await createRelationsBetweenUsersAndReserve({
      classmatesEnrollments,
      reserveId: reserve.id,
      loggedUserEnrollment: userEnrollment,
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

      assertUserIsOnReserve(userId, reserve.userReserve);

      await assertIsReserveLeader(userId, reserve);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await deleteReserve(reserveId);

    return res.json({ id: reserveId });
  }
}

export default new ReserveController();
