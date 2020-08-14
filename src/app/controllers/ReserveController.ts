import { Request, Response } from 'express';

import { RequestBody } from '~/types';

import prisma from '~/prisma';

interface StoreReserve {
  roomId: number;
  scheduleId: number;
  date: number;
  classmates: number[];
}

type StoreRequest = RequestBody<StoreReserve>;

class ReserveController {
  async index(request: Request, response: Response) {
    const reserve = await prisma.reserve.findMany({});
    return response.json(reserve);
  }

  async store(request: StoreRequest, response: Response) {
    const { roomId, scheduleId, date, classmates } = request.body;

    console.log(date);

    const user = await prisma.reserve.create({
      data: {
        date: new Date(date),
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
