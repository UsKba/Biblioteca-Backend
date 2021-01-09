import { Request, Response } from 'express';

import { assertInitialDateIsBeforeEndDate, stringsToDateArray } from '~/app/utils/date';

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

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour, periodId } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);

      await assertPeriodExists({ id: periodId });
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
    // nn pode atualizar o periodId

    const id = Number(request.params.id);

    const { initialHour, endHour } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertIfScheduleExists(id);

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
}

export default new ScheduleController();
