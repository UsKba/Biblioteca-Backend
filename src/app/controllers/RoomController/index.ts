import { Request, Response } from 'express';

import { RequestBodyParamsId, RequestBody, RequestParamsId } from '~/types/request';

import prisma from '~/prisma';

import { assertInitialsNotExists, assertRoomIdExists } from './tradingRules';

interface StoreRoom {
  initials: string;
}

interface UpdateRoom {
  initials?: string;
  available?: boolean;
}

type StoreRequest = RequestBody<StoreRoom>;
type UpdateRequest = RequestBodyParamsId<UpdateRoom>;

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
      if (initials) {
        await assertInitialsNotExists(initials);
      }
    } catch (e) {
      return response.status(400).json({ error: e.message });
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
    const id = Number(request.params.id);

    try {
      await assertRoomIdExists(id);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }

    await prisma.room.delete({
      where: { id },
    });

    return response.json({ id });
  }
}

export default new RoomController();
