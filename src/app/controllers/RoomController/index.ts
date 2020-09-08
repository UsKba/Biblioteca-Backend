import { Request, Response } from 'express';

import { RequestBodyParamsId, RequestBody, RequestParamsId } from '~/types';

import prisma from '~/prisma';

interface StoreRoom {
  initials: string;
}

interface UpdateRoom {
  initials?: string;
  available?: boolean;
}

type StoreRequest = RequestBody<StoreRoom>;
type UpdateRequest = RequestBodyParamsId<UpdateRoom>;

async function assertInitialsNotExists(initials: string) {
  const room = await prisma.room.findOne({
    where: { initials },
  });

  if (room !== null) {
    throw new Error('Já existe sala com essa sigla');
  }
}
async function assertRoomIdExists(id: number) {
  const roomExists = await prisma.room.findOne({ where: { id: Number(id) } });

  if (!roomExists) {
    throw new Error('Sala não encontrada');
  }
}

class RoomController {
  async index(request: Request, response: Response) {
    const rooms = await prisma.room.findMany({});

    return response.json(rooms);
  }

  async store(request: StoreRequest, response: Response) {
    const { initials } = request.body;

    try {
      await assertInitialsNotExists(initials);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    const newRoom = await prisma.room.create({
      data: {
        initials,
      },
    });

    return response.json(newRoom);
  }

  async update(request: UpdateRequest, response: Response) {
    const { id } = request.params;
    const { available, initials } = request.body;

    try {
      await assertRoomIdExists(Number(id));
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    if (initials) {
      const roomWithSameInitials = await prisma.room.findOne({
        where: { initials },
      });

      if (roomWithSameInitials !== null) {
        return response.status(400).json({ error: 'Já existe sala com essa sigla' });
      }
    }

    const room = await prisma.room.update({
      where: { id: Number(id) },
      data: {
        available,
        initials,
      },
    });

    return response.json(room);
  }

  async delete(request: RequestParamsId, response: Response) {
    const { id } = request.params;

    const room = await prisma.room.findOne({
      where: { id: Number(id) },
    });

    if (room === null) {
      return response.status(400).json({ error: 'Sala não encontrada' });
    }

    await prisma.room.delete({
      where: {
        id: Number(id),
      },
    });

    return response.json({
      id: Number(id),
    });
  }
}

export default new RoomController();
