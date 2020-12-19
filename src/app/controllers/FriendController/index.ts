import { Response } from 'express';

import { RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

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
            FriendUser1: { some: { userId2: userId } },
          },
          {
            FriendUser2: { some: { userId1: userId } },
          },
        ],
      },
    });

    return res.json(friends);
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
