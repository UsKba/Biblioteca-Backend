import { Response } from 'express';

import { RequestAuthBody } from '~/types/auth';

import prisma from '~/prisma';

import { assertInviteExists } from '../InviteController/tradingRules';
import { deleteInvite } from '../InviteController/utils';

interface StoreInviteConfirmation {
  id: number;
}

type StoreRequest = RequestAuthBody<StoreInviteConfirmation>;

class InviteConfirmationController {
  async store(req: StoreRequest, res: Response) {
    const { id } = req.body;

    try {
      const invite = await assertInviteExists(id);
      await deleteInvite(id);

      const friend = await prisma.friend.create({
        data: {
          user1: { connect: { id: invite.userId } },
          user2: { connect: { id: invite.recipientId } },
        },
      });

      return res.json(friend);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InviteConfirmationController();
