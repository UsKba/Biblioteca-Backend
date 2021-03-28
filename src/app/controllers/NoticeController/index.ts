import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import noticeConfig from '~/config/notice';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { updateComputer } from '../ComputersController/functions';
import { updateRoom } from '../RoomController/functions';
import { assertNoticeExists, assertNoticeExpiredDateIsNotBeforeOfNow, assertNoticeIsActive } from './tradingRules';
import { formatNoticeToResponse } from './utils';

interface RoomData {
  id: number;
  status: number;
}

interface ComputerData {
  id: number;
  status: number;
}

interface StoreData {
  title: string;
  content: string;
  expiredAt: string;
  imageCode: number;
  type: number;

  roomData?: RoomData;
  computerData?: ComputerData;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreData>;
type DeleteRequest = RequestAuthParamsId;

class NoticeController {
  async index(req: IndexRequest, res: Response) {
    const notices = await prisma.notice.findMany({
      where: {
        status: noticeConfig.statusActive,
      },
      include: {
        userCreator: {
          include: { color: true, role: true },
        },
      },
    });

    const noticesFormatted = notices.map(formatNoticeToResponse);

    return res.json(noticesFormatted);
  }

  async store(req: StoreRequest, res: Response) {
    const adminId = req.userId as number;
    const { title, content, imageCode, type, expiredAt: expiredAtString } = req.body;

    const expiredAt = new Date(expiredAtString);

    try {
      assertNoticeExpiredDateIsNotBeforeOfNow(expiredAt);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        imageCode,
        expiredAt,

        status: noticeConfig.statusActive,
        userCreator: { connect: { id: adminId } },
      },
      include: {
        userCreator: {
          include: { color: true, role: true },
        },
      },
    });

    // try-catch
    if (type === noticeConfig.types.room) {
      const { roomData } = req.body;

      if (!roomData) {
        // MUDAR DEPOIS
        // ganrantir que o status é valido
        // garantir que a sala existe
        return res.status(400).send();
      }

      await updateRoom({ id: roomData.id, status: roomData.status });

      await prisma.noticeRoom.create({
        data: {
          notice: { connect: { id: notice.id } },
          room: { connect: { id: roomData.id } },
          roomStatus: roomData.status,
        },
      });
    }

    // try-catch
    if (type === noticeConfig.types.computer) {
      const { computerData } = req.body;

      if (!computerData) {
        // MUDAR DEPOIS
        // ganrantir que o status é valido
        // garantir que o computador existe
        return res.status(400).send();
      }

      await updateComputer({ id: computerData.id, status: computerData.status });

      await prisma.noticeComputer.create({
        data: {
          notice: { connect: { id: notice.id } },
          computer: { connect: { id: computerData.id } },
          computerStatus: computerData.status,
        },
      });
    }

    const noticeFormatted = formatNoticeToResponse(notice);

    return res.json(noticeFormatted);
  }

  async delete(req: DeleteRequest, res: Response) {
    const noticeId = Number(req.params.id);

    try {
      const notice = await assertNoticeExists({ id: noticeId });
      assertNoticeIsActive(notice);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const noticeUpdated = await prisma.notice.update({
      data: {
        status: noticeConfig.statusInactive,
      },
      where: {
        id: noticeId,
      },
      include: {
        userCreator: {
          include: { color: true, role: true },
        },
      },
    });

    return res.json({ id: noticeUpdated.id });
  }
}

export default new NoticeController();
