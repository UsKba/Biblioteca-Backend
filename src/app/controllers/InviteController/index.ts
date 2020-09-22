import { Response } from 'express';

import { RequestAuthBody, RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { assertUserIdExists } from '../UserController/tradingRules';
import { assertInviteNotExists, assertUserIsNotFriend } from './tradingRules';
import { deleteInvite } from './utils';

interface StoreInvite {
  recipientId: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreInvite>;
type DeleteRequest = RequestAuthParamsId;

class InviteController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const invites = await prisma.invite.findMany({
      where: { recipientId: userId },
    });

    return res.json(invites);
  }

  async store(req: StoreRequest, res: Response) {
    const { recipientId } = req.body;
    const userId = req.userId as number;

    try {
      await assertUserIdExists(recipientId);
      await assertInviteNotExists(userId, recipientId);
      await assertUserIsNotFriend(userId, recipientId);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const invite = await prisma.invite.create({
      data: {
        user: { connect: { id: userId } },
        recipient: { connect: { id: recipientId } },
      },
    });

    return res.json(invite);
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);

    try {
      const result = await deleteInvite(id);

      return res.json(result);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InviteController();
