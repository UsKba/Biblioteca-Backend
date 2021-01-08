import { Response } from 'express';

import { setScheduleHoursAndMinutes, getDateOnBrazilTimezone } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/requestAuth';

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
    const startDate = getDateOnBrazilTimezone(new Date());

    const reserves = await prisma.reserve.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        adminId: true,
        room: true,
        schedule: true,
        userReserve: {
          select: {
            status: true,
            user: {
              include: { color: true },
            },
          },
          where: {
            NOT: { status: reserveConfig.userReserve.statusRefused },
          },
        },
      },
      where: {
        userReserve: {
          some: {
            userId,
            NOT: { status: reserveConfig.userReserve.statusRefused },
          },
        },
        date: {
          gte: startDate,
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

    const { roomId, scheduleId, year, month, day, classmatesEnrollments, name } = request.body;

    const date = new Date(year, month, day);
    let dateWithScheduleHours: Date;

    try {
      assertUserIsOnClassmatesEnrollments(userEnrollment, classmatesEnrollments);
      assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments);
      assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments);
      assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments);

      const schedule = await assertIfScheduleExists(scheduleId);
      dateWithScheduleHours = setScheduleHoursAndMinutes(date, schedule.initialHour);

      assertIfTheReserveIsNotOnWeekend(dateWithScheduleHours);
      assertIfTheReserveIsNotBeforeOfNow(dateWithScheduleHours);

      await assertRoomIdExists(roomId);
      await assertRoomIsOpenOnThisDateAndSchedule(scheduleId, roomId, dateWithScheduleHours);
      await assertUsersExistsOnDatabase(classmatesEnrollments);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const reserve = await prisma.reserve.create({
      data: {
        name,
        date: dateWithScheduleHours,
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
          select: {
            status: true,
            user: {
              include: { color: true },
            },
          },
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
