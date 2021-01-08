import { Request, Response } from 'express';

import { RequestBodyParamsId, RequestBody, RequestParamsId } from '~/types/request';

import prisma from '~/prisma';

import { assertRoomNotExists, assertRoomExists } from './tradingRules';

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
      await assertRoomNotExists({ initials });
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
    const id = Number(request.params.id);
    const { available, initials } = request.body;

    try {
      await assertRoomExists({ id });

      if (initials) {
        await assertRoomNotExists({ initials });
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
      await assertRoomExists({ id });
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
