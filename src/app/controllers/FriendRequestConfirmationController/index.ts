import { Response } from 'express';

import { RequestAuthBody } from '~/types/auth';

import prisma from '~/prisma';

import { assertFriendRequestExists } from '../FriendRequestController/tradingRules';
import { assertUserWhoIsConfirmingIsTheReceiver } from './tradingRules';

interface StoreFriendRequestConfirmation {
  id: number;
}

type StoreRequest = RequestAuthBody<StoreFriendRequestConfirmation>;

class FriendRequestConfirmationController {
  async store(req: StoreRequest, res: Response) {
    const { id } = req.body;
    const userId = req.userId as number;

    try {
      const friendRequest = await assertFriendRequestExists(id);
      assertUserWhoIsConfirmingIsTheReceiver(userId, friendRequest.receiverId);

      await prisma.friend.create({
        data: {
          User1: { connect: { id: friendRequest.senderId } },
          User2: { connect: { id: friendRequest.receiverId } },
        },
        include: {
          User1: true,
          User2: true,
        },
      });

      await prisma.friendRequest.delete({ where: { id } });

      return res.status(200).send();
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new FriendRequestConfirmationController();
