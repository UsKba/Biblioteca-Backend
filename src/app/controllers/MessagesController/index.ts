import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestAuth, RequestAuthBody } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertUserExists } from '../UserController/tradingRules';
import { assertMessageReceiverIsAdmin, assertMessageSenderIsTheLoggedUser } from './tradingRules';
import { formatMessageToResponse } from './utils';

interface Store {
  senderId: number;
  receiverId: number;
  subject: string;
  content: string;
  tags: number[];
}

type StoreRequest = RequestAuthBody<Store>;

class MessagesController {
  async index(req: RequestAuth, res: Response) {
    return res.json({ ok: true });
  }

  async store(req: StoreRequest, res: Response) {
    const userId = req.userId as number;

    const { senderId, receiverId, subject, content, tags } = req.body;

    // colocar tag 'default' quando não hover

    // meta: consertar os try/catch dos controllers (typescript)
    // meta: padronizar enrollments nos testes

    try {
      const userSender = await assertUserExists({ id: senderId });
      const userReceiver = await assertUserExists({ id: receiverId });

      assertMessageSenderIsTheLoggedUser(userSender.id, userId);
      assertMessageReceiverIsAdmin(userReceiver);
    } catch (e) {
      const { message, statusCode } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }

    const message = await prisma.message.create({
      data: {
        subject,
        content,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
      },
      include: {
        sender: { include: { color: true, role: true } },
        receiver: { include: { color: true, role: true } },
      },
    });

    const messageFormatted = formatMessageToResponse(message);

    return res.json(messageFormatted);
  }
}

export default new MessagesController();
