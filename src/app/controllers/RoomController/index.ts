import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import roomConfig from '~/config/room';

import { RequestAuth, RequestAuthBody, RequestAuthBodyParamsId, RequestAuthParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { updateRoom } from './functions';
import { assertRoomNotExists, assertRoomExists, assertIsValidRoomStatus } from './tradingRules';

interface StoreRoom {
  initials: string;
}

interface UpdateRoom {
  initials?: string;
  status?: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreRoom>;
type UpdateRequest = RequestAuthBodyParamsId<UpdateRoom>;
type DeleteRequest = RequestAuthParamsId;

class RoomController {
  async index(req: IndexRequest, res: Response) {
    const rooms = await prisma.room.findMany({});

    return res.json(rooms);
  }

  async store(req: StoreRequest, res: Response) {
    const { initials } = req.body;

    try {
      await assertRoomNotExists({ initials });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
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
      const roomUpdated = await updateRoom({ id, status, initials });
      return res.json(roomUpdated);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);

    try {
      await assertRoomExists({ id });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    await prisma.room.delete({
      where: { id },
    });

    return res.json({ id });
  }
}

export default new RoomController();
