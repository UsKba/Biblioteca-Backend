import { Request, Response } from 'express';

import { RequestBodyParamsId, RequestBody } from '~/types';

import prisma from '~/prisma';

interface Room {
  initials: string;
  status: number;
}

type UpdateRequest = RequestBodyParamsId<Room>;

type StoreRequest = RequestBody<Room>;

class RoomController {
  async store(request: StoreRequest, response: Response) {
    const data: Room = request.body;

    const room = await prisma.room.create({
      data,
    });

    return response.json(room);
  }

  async index(request: Request, response: Response) {
    const rooms = await prisma.room.findMany({});

    return response.json(rooms);
  }

  async update(request: UpdateRequest, response: Response) {
    const { id } = request.params;

    const roomExists = await prisma.room.findOne({ where: { id: Number(id) } });

    if (roomExists === null) {
      return response.status(400).json({ error: 'Room not found.' });
    }

    const room = await prisma.room.update({
      where: { id: Number(id) },
      data: request.body,
    });

    return response.json(room);
  }
}

export default new RoomController();
