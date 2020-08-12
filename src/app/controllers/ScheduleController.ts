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
  initialHour?: string;
  endHour?: string;
}

type StoreRequest = RequestBody<StoreSchedule>;
type UpdateRequest = RequestBodyParamsId<UpdateSchedule>;

class ScheduleController {
  async index(request: Request, response: Response) {
    const schedules = await prisma.schedule.findMany({});

    return response.json(schedules);
  }

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour } = request.body;

    // A hora final nao pode ser antes da de inicio

    const [initialDate, endDate] = stringsToDateArray(initialHour, endHour);

    if (isBefore(endDate, initialDate)) {
      return response.status(400).json({ error: 'A hora final não pode ser antes da de inicio' });
    }

    // Não pode ser alocado dois horários dentro do mesmo intervalo de tempo
    // 07:00 -> 08:00
    // 07:30 -> 08:30 X - Não pode

    const schedules = await prisma.schedule.findMany({});

    for (let i = 0; i < schedules.length; i += 1) {
      const [dbInitialDate, dbEndDate] = stringsToDateArray(schedules[i].initialHour, schedules[i].endHour);

      const areOverlapping = areIntervalsOverlapping(
        // ano mes dia hora minuto

        { start: dbInitialDate, end: dbEndDate },
        { start: initialDate, end: endDate },
        { inclusive: false }
      );

      // 10:00 -> 11:00
      // 11:00 -> 12:00

      if (areOverlapping) {
        return response.status(400).json({ error: 'Não é possível colocar dois horários no mesmo intervalo' });
      }
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
    const { id } = request.params;
    const { initialHour, endHour } = request.body;

    const schedule = await prisma.schedule.findOne({
      where: { id: Number(id) },
    });

    if (schedule === null) {
      return response.status(400).json({ error: 'Horário não encontrado' });
    }

    const newSchudule = await prisma.schedule.update({
      data: {
        initialHour,
        endHour,
      },
      where: { id: Number(id) },
    });

    return response.json(newSchudule);
  }

  async delete(req: Request, res: Response) {
    await prisma.schedule.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new ScheduleController();

// const areOverlapping = areIntervalsOverlapping(
//   // ano mes dia hora minuto

//   { start: new Date(0, 0, 0, 7, 0), end: new Date(0, 0, 0, 8, 0) },
//   { start: new Date(0, 0, 0, 8, 0), end: new Date(0, 0, 0, 9, 0) },
//   { inclusive: false }
// );
