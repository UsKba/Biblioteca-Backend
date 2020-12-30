import { Response } from 'express';

import { RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { formatUserToResponse } from '../UserController/utils';
import { assertFriendExists } from './tradingRules';

type IndexRequest = RequestAuth;
type DeleteRequest = RequestAuthParamsId;

class FriendController {
  async index(req: IndexRequest, res: Response) {
    // When you send -> userId1
    // When you receive -> userId2

    const userId = req.userId as number;

    const friends = await prisma.user.findMany({
      where: {
        OR: [
          {
            friendUser1: { some: { userId2: userId } },
          },
          {
            friendUser2: { some: { userId1: userId } },
          },
        ],
      },
      include: {
        color: true,
      },
    });

    const friendsFormatted = friends.map(formatUserToResponse);

    return res.json(friendsFormatted);
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);

    try {
      await assertFriendExists({ id });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const friend = await prisma.friend.delete({
      where: { id },
    });

    return res.json(friend);
  }
}

export default new FriendController();
