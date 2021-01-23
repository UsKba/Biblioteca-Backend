import { Request, Response } from 'express';

import { assertInitialDateIsBeforeEndDate, stringsToDateArray } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import { RequestBody, RequestBodyParamsId } from '~/types/request';

import prisma from '~/prisma';

import { assertPeriodExists } from '../PeriodController/tradingRules';
import { assertIfScheduleExists, assertScheduleIsNotOverlappingOnDatabase } from './tradingRules';

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
  async index(req: Request, res: Response) {
    const schedules = await prisma.schedule.findMany({});

    return res.json(schedules);
  }

  async store(req: StoreRequest, res: Response) {
    const { initialHour, endHour, periodId } = req.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);

      await assertPeriodExists({ id: periodId });
      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const schedule = await prisma.schedule.create({
      data: {
        initialHour,
        endHour,
        period: { connect: { id: periodId } },
      },
    });

    return res.json(schedule);
  }

  async update(req: UpdateRequest, res: Response) {
    // nn pode atualizar o periodId

    const id = Number(req.params.id);

    const { initialHour, endHour } = req.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertIfScheduleExists(id);

      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate, id);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const newSchudule = await prisma.schedule.update({
      data: {
        initialHour,
        endHour,
      },
      where: { id },
    });

    return res.json(newSchudule);
  }
}

export default new ScheduleController();
