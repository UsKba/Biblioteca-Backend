import { Request, Response } from 'express';

import roomConfig from '~/config/room';

import { RequestBodyParamsId, RequestBody, RequestParamsId } from '~/types/request';

import prisma from '~/prisma';

import { assertRoomNotExists, assertRoomExists, assertIsValidRoomStatus } from './tradingRules';

interface StoreRoom {
  initials: string;
}

interface UpdateRoom {
  initials?: string;
  status?: number;
}

type StoreRequest = RequestBody<StoreRoom>;
type UpdateRequest = RequestBodyParamsId<UpdateRoom>;

class RoomController {
  async index(req: Request, res: Response) {
    const rooms = await prisma.room.findMany({});

    return res.json(rooms);
  }

  async store(req: StoreRequest, res: Response) {
    const { initials } = req.body;

    try {
      await assertRoomNotExists({ initials });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const newRoom = await prisma.room.create({
      data: {
        initials,
        status: roomConfig.disponible,
      },
    });

    return res.json(newRoom);
  }

  async update(req: UpdateRequest, res: Response) {
    const id = Number(req.params.id);
    const { status, initials } = req.body;

    try {
      await assertRoomExists({ id });

      if (status) {
        assertIsValidRoomStatus(status);
      }

      if (initials) {
        await assertRoomNotExists({ initials });
      }
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const room = await prisma.room.update({
      where: { id },
      data: {
        status,
        initials,
      },
    });

    return res.json(room);
  }

  async delete(req: RequestParamsId, res: Response) {
    const id = Number(req.params.id);

    try {
      await assertRoomExists({ id });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    await prisma.room.delete({
      where: { id },
    });

    return res.json({ id });
  }
}

export default new RoomController();
