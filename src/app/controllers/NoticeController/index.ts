import { Response } from 'express';

import { RequestAuthBody } from '~/types/requestAuth';

import prisma from '~/prisma';

import { formatNoticeToResponse } from './utils';

interface StoreData {
  title: string;
  content: string;
  expiredAt: Date;
}

type StoreRequest = RequestAuthBody<StoreData>;

class NoticeController {
  async store(req: StoreRequest, res: Response) {
    const adminId = req.userId as number;
    const { title, content, expiredAt } = req.body;

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
