import { Response } from 'express';

import { ScheduleUpdateInput } from '@prisma/client';

import { assertInitialDateIsBeforeEndDate, stringsToDateArray } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import { RequestAuth, RequestAuthBody, RequestAuthBodyParamsId } from '~/types/requestAuth';

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
  periodId?: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreSchedule>;
type UpdateRequest = RequestAuthBodyParamsId<UpdateSchedule>;

class ScheduleController {
  async index(req: IndexRequest, res: Response) {
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
    const id = Number(req.params.id);

    const { initialHour, endHour, periodId } = req.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertIfScheduleExists(id);

      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate, id);

      if (periodId) {
        await assertPeriodExists({ id: periodId });
      }
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    function getUpdateData() {
      let updateData: ScheduleUpdateInput = {
        initialHour,
        endHour,
      };

      if (periodId) {
        updateData = {
          ...updateData,
          period: { connect: { id: periodId } },
        };
      }

      return updateData;
    }

    const updateData = getUpdateData();

    const newSchudule = await prisma.schedule.update({
      data: updateData,
      where: { id },
    });

    return res.json(newSchudule);
  }
}

export default new ScheduleController();
