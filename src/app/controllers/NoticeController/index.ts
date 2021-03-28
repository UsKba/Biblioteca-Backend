import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import noticeConfig from '~/config/notice';

import { RequestAuth, RequestAuthBody, RequestAuthParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertNoticeExists, assertNoticeExpiredDateIsNotBeforeOfNow } from './tradingRules';
import { formatNoticeToResponse } from './utils';

interface StoreData {
  title: string;
  content: string;
  expiredAt: string;
  imageCode: number;
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
    const { title, content, imageCode, expiredAt: expiredAtString } = req.body;

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

    const noticeFormatted = formatNoticeToResponse(notice);

    return res.json(noticeFormatted);
  }

  async delete(req: DeleteRequest, res: Response) {
    const noticeId = Number(req.params.id);

    try {
      assertNoticeExists({ id: noticeId });
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

    const noticeFormatted = formatNoticeToResponse(noticeUpdated);

    return res.json(noticeFormatted);
  }
}

export default new NoticeController();
