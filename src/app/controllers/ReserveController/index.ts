import { Response } from 'express';

import { setScheduleHoursAndMinutes, getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import reserveConfig from '~/config/reserve';
import userConfig from '~/config/user';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertRoomExists, assertRoomIsDisponible } from '../RoomController/tradingRules';
import { assertIfScheduleExists } from '../ScheduleController/tradingRules';
import { assertUsersExistsOnDatabase } from '../UserController/tradingRules';
import {
  assertUserIsOnClassmatesEnrollments,
  assertIfHaveTheMinimunClassmatesRequired,
  assertIfHaveTheMaximumClassmatesRequired,
  assertClassmatesEnrollmentsAreDiferent,
  assertRoomIsOpenOnThisDateAndSchedule,
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
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;
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
            color: true,
            user: {
              include: { role: true },
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

    return res.json(reservesFormatted);
  }

  async store(req: StoreRequest, res: Response) {
    const userEnrollment = req.userEnrollment as string;
    const userRoleSlug = req.userRoleSlug as string;

    const { roomId, scheduleId, year, month, day, classmatesEnrollments, name } = req.body;

    const date = new Date(year, month, day);
    let dateWithScheduleHours: Date;

    try {
      if (userRoleSlug === userConfig.role.student.slug) {
        assertUserIsOnClassmatesEnrollments(userEnrollment, classmatesEnrollments);
      }

      assertIfHaveTheMinimunClassmatesRequired(classmatesEnrollments);
      assertIfHaveTheMaximumClassmatesRequired(classmatesEnrollments);
      assertClassmatesEnrollmentsAreDiferent(classmatesEnrollments);

      const schedule = await assertIfScheduleExists(scheduleId);
      dateWithScheduleHours = setScheduleHoursAndMinutes(date, schedule.initialHour);

      assertIfTheReserveIsNotOnWeekend(dateWithScheduleHours);
      assertIfTheReserveIsNotBeforeOfNow(dateWithScheduleHours);

      const room = await assertRoomExists({ id: roomId });
      assertRoomIsDisponible(room);

      await assertRoomIsOpenOnThisDateAndSchedule(scheduleId, roomId, dateWithScheduleHours);
      await assertUsersExistsOnDatabase(classmatesEnrollments);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const reserve = await prisma.reserve.create({
      data: {
        name,
        date: dateWithScheduleHours,
        admin: { connect: { enrollment: classmatesEnrollments[0] } },
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
            color: true,
            user: {
              include: { role: true },
            },
          },
        },
      },
    });

    const reserveUsers = await createRelationsBetweenUsersAndReserve({
      classmatesEnrollments,
      reserveId: reserve.id,
      leaderEnrollment: classmatesEnrollments[0],
    });

    const reserveFormatted = {
      ...formatReserveToResponse(reserve),
      users: reserveUsers,
    };

    return res.json(reserveFormatted);
  }

  async delete(req: RequestAuthParamsId, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.id);

    try {
      const reserve = await assertReserveExists(reserveId);

      assertUserIsOnReserve(userId, reserve.userReserve);

      await assertIsReserveLeader(userId, reserve);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    await deleteReserve(reserveId);

    return res.json({ id: reserveId });
  }
}

export default new ReserveController();
