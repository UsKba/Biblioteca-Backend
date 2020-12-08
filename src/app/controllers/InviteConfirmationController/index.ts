import { Response } from 'express';

import { RequestAuthBody } from '~/types/auth';

import prisma from '~/prisma';

import { assertInviteExists } from '../InviteController/tradingRules';
import { assertUserWhoIsConfirmingIsTheReceiver } from './tradingRules';

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
      assertUserWhoIsConfirmingIsTheReceiver(userId, invite.receiverId);

      const friend = await prisma.friend.create({
        data: {
          User1: { connect: { id: invite.senderId } },
          User2: { connect: { id: invite.receiverId } },
        },
        include: {
          User1: true,
          User2: true,
        },
      });

      await prisma.invite.delete({ where: { id } });

      const friendFormatted = {
        id: friend.id,
        user1: friend.User1,
        user2: friend.User2,
      };

      return res.json(friendFormatted);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InviteConfirmationController();
