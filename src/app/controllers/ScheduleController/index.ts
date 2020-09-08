import { Request, Response } from 'express';

import { isBefore, areIntervalsOverlapping } from 'date-fns';

import { stringsToDateArray } from '~/app/utils/date';

import { RequestBody, RequestBodyParamsId } from '~/types';

import prisma from '~/prisma';

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

async function areSchedulesOverlapping(initialDate: Date, endDate: Date, id?: number) {
  const schedules = await prisma.schedule.findMany({});

  for (let i = 0; i < schedules.length; i += 1) {
    if (schedules[i].id === id) {
      continue;
    }

    const [dbInitialDate, dbEndDate] = stringsToDateArray(schedules[i].initialHour, schedules[i].endHour);

    const areOverlapping = areIntervalsOverlapping(
      { start: dbInitialDate, end: dbEndDate },
      { start: initialDate, end: endDate },
      { inclusive: false }
    );

    if (areOverlapping) {
      return true;
    }
  }

  return false;
}

class ScheduleController {
  async index(request: Request, response: Response) {
    const schedules = await prisma.schedule.findMany({});

    return response.json(schedules);
  }

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour } = request.body;

    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    if (isBefore(endDate, initialDate)) {
      return response.status(400).json({ error: 'A hora final não pode ser antes da de inicio' });
    }

    const areOverlapping = await areSchedulesOverlapping(initialDate, endDate);

    if (areOverlapping) {
      return response.status(400).json({ error: 'Não é possível colocar dois horários no mesmo intervalo' });
    }

    const schedule = await prisma.schedule.create({
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

    const schedule = await prisma.schedule.findOne({
      where: { id },
    });

    if (schedule === null) {
      return response.status(400).json({ error: 'Horário não encontrado' });
    }

    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    if (isBefore(endDate, initialDate)) {
      return response.status(400).json({ error: 'A hora final não pode ser antes da de inicio' });
    }

    const scheduleAreRigth = await areSchedulesOverlapping(initialDate, endDate, id);

    if (scheduleAreRigth === true) {
      return response.status(400).json({ error: 'Não é possível colocar dois horários no mesmo intervalo' });
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

// aaaaaaaaa
// hora: 99
