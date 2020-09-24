import { Request, Response } from 'express';

import { isBefore } from 'date-fns';

import { stringsToDateArray } from '~/app/utils/date';

import { RequestBody, RequestBodyParamsId } from '~/types';

import prisma from '~/prisma';

import {
  assertIfScheduleExists,
  assertInitialDateIsBeforeEndDate,
  assertScheduleIsNotOverlappingOnDatabase,
} from './tradingRules';

interface StoreSchedule {
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
    const schedules = await prisma.schedules.findMany({});

    return response.json(schedules);
  }

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const schedule = await prisma.schedules.create({
      data: {
        initialHour,
        endHour,
      },
    });

    return response.json(schedule);
  }

  async update(request: UpdateRequest, response: Response) {
    const id = Number(request.params.id);

    const { initialHour, endHour } = request.body;
    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    if (isBefore(endDate, initialDate)) {
      return response.status(400).json({ error: 'A hora final não pode ser antes da de inicio' });
    }

    try {
      assertInitialDateIsBeforeEndDate(initialDate, endDate);
      await assertIfScheduleExists(id);
      await assertScheduleIsNotOverlappingOnDatabase(initialDate, endDate, id);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const newSchudule = await prisma.schedules.update({
      data: {
        initialHour,
        endHour,
      },
      where: { id },
    });

    return response.json(newSchudule);
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.schedules.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new ScheduleController();
