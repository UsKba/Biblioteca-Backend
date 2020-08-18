import { Request, Response } from 'express';

import { isBefore } from 'date-fns';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

import { resetSecondsAndMiliseconds, splitSingleDate } from '../utils/date';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  day: number;
  month: number;
  classmatesIDs: number[];
}

type StoreRequest = RequestBody<StoreReserve>;

class ReserveController {
  async index(request: Request, response: Response) {
    const reserve = await prisma.reserve.findMany({});
    return response.json(reserve);
  }

  async store(request: StoreRequest, response: Response) {
    const { roomId, scheduleId, month, day, classmatesIDs } = request.body;

    const schedule = await prisma.schedule.findOne({ where: { id: scheduleId } });

    if (!schedule) {
      return response.status(400).json({ error: 'Horário não existe' });
    }

    const [hours, minutes] = splitSingleDate(schedule.initialHour);

    const targetMonth = month - 1; // Jan is month 0

    const now = new Date();
    const reserveDate = new Date(2020, targetMonth, day, hours, minutes, 0, 0);

    if (isBefore(reserveDate, now)) {
      return response.status(400).json({ error: 'A Data não pode ser anterior a atual' });
    }

    const roomExists = await prisma.room.findOne({
      where: { id: roomId },
    });

    if (!roomExists) {
      return response.status(400).json({ error: 'Sala não encontrada' });
    }

    if (classmatesIDs.length < 3) {
      return response.status(400).json({ error: 'São necessários ao menos 3 alunos' });
    }

    for (let i = 0; i < classmatesIDs.length; i += 1) {
      const classmateId = classmatesIDs[i];

      // eslint-disable-next-line no-await-in-loop
      const userExists = await prisma.user.findOne({
        where: { id: classmateId },
      });

      if (!userExists) {
        return response.status(400).json({ error: `Usuário ${classmateId} não encontrado` });
      }
    }

    const user = await prisma.reserve.create({
      data: {
        date: reserveDate, // dia

        room: { connect: { id: roomId } },
        schedule: { connect: { id: scheduleId } },
      },
    });

    return response.json(user);
  }

  // async update(request: UpdateRequest, response: Response) {
  //   const { id, ...dataToUpdate } = request.body;

  //   const reserveExists = await prisma.user.findOne({
  //     where: { id: Number(id) },
  //   });

  //   if (reserveExists === null) {
  //     return response.status(400).json({ error: 'Reserva não encontrada' });
  //   }

  //   const reserve = await prisma.reserve.update({

  //     data: dataToUpdate,
  //     where: { id },

  //   });

  //   return response.json(user);
  // }
}

export default new ReserveController();
