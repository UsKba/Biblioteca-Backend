import { Response } from 'express';

import { RequestAuthBody } from '~/types/auth';

import prisma from '~/prisma';

import { assertInviteExists } from '../InviteController/tradingRules';
import { deleteInvite } from '../InviteController/utils';
import { assertUserWhoIsConfirmingIsTheRecipient } from './tradingRules';

interface StoreInviteConfirmation {
  id: number;
}

type StoreRequest = RequestAuthBody<StoreInviteConfirmation>;

class InviteConfirmationController {
  async store(req: StoreRequest, res: Response) {
    const { id } = req.body;
    const userId = req.userId as number;

    try {
      const invite = await assertInviteExists(id);
      assertUserWhoIsConfirmingIsTheRecipient(userId, invite.recipientId);

      const friend = await prisma.friend.create({
        data: {
          user1: { connect: { id: invite.userId } },
          user2: { connect: { id: invite.recipientId } },
        },
      });

      await deleteInvite(id);

      return res.json(friend);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InviteConfirmationController();
