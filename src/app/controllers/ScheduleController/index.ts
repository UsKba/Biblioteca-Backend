import { Request, Response } from 'express';

import { assertInitialDateIsBeforeEndDate, stringsToDateArray } from '~/app/utils/date';

import { RequestBody, RequestBodyParamsId } from '~/types';

import prisma from '~/prisma';

import { assertPeriodExists } from '../PeriodController/tradingRules';
import {
  assertIfScheduleExists,
  assertScheduleIsNotOverlappingOnDatabase,
  assertScheduleIsOnPeriodInterval,
} from './tradingRules';

interface StoreSchedule {
  periodId: number;
  initialHour: string;
  endHour: string;
}

interface UpdateSchedule {
  initialHour: string;
  endHour: string;
}

type StoreRequest = RequestBody<StoreSchedule>;
type UpdateRequest = RequestBodyParamsId<UpdateSchedule>;

class ScheduleController {
  async index(request: Request, response: Response) {
    const schedules = await prisma.schedule.findMany({});

    return response.json(schedules);
  }

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour, periodId } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);

      const period = await assertPeriodExists(periodId);

      assertScheduleIsOnPeriodInterval(period, initialDate, endDate);
      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const schedule = await prisma.schedule.create({
      data: {
        initialHour,
        endHour,
        period: { connect: { id: periodId } },
      },
    });

    return response.json(schedule);
  }

  async update(request: UpdateRequest, response: Response) {
    // assertScheduleIsOnPeriodInterval
    // nn pode atualizar o periodId

    const id = Number(request.params.id);

    const { initialHour, endHour } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertIfScheduleExists(id);

      // assertScheduleIsOnPeriodInterval(period, initialDate, endDate);

      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate, id);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const newSchudule = await prisma.schedule.update({
      data: {
        initialHour,
        endHour,
      },
      where: { id },
    });

    return response.json(newSchudule);
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.schedule.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new ScheduleController();
