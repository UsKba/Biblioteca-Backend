import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestAuthBody } from '~/types/requestAuth';

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

      const friend = await prisma.friend.create({
        data: {
          user1: { connect: { id: friendRequest.senderId } },
          user2: { connect: { id: friendRequest.receiverId } },
        },
      });

      await prisma.friendRequest.delete({ where: { id } });

      return res.json(friend);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }
}

export default new FriendRequestConfirmationController();
