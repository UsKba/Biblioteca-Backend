import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestAuthBody } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertNoticeExpiredDateIsNotBeforeOfNow } from './tradingRules';
import { formatNoticeToResponse } from './utils';

interface StoreData {
  title: string;
  content: string;
  expiredAt: string;
}

type StoreRequest = RequestAuthBody<StoreData>;

class NoticeController {
  async store(req: StoreRequest, res: Response) {
    const adminId = req.userId as number;
    const { title, content, expiredAt: expiredAtString } = req.body;

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
        expiredAt,
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
}

export default new NoticeController();
