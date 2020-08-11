import { Request, Response } from 'express';

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

function splitSingleDate(dateStr: string) {
  const [hours, minutes] = dateStr.split(':');

  return [Number(hours), Number(minutes)] as [number, number];
}

class ScheduleController {
  async index(request: Request, response: Response) {
    const schedules = await prisma.schedule.findMany({});

    return response.json(schedules);
  }

  async store(request: StoreRequest, response: Response) {
    const { initialHour, endHour } = request.body;

    // A hora final nao pode ser antes da de inicio
    //

    // const [initialHourHours, initialHourMinutes] = splitSingleDate(initialHour);
    // const [endHourHours, endHourMinutes] = splitSingleDate(endHour);

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
}

export default new ScheduleController();
