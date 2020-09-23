import { Response } from 'express';

import { RequestAuth } from '~/types/auth';

import prisma from '~/prisma';

type IndexRequest = RequestAuth;

class FriendController {
  async index(req: IndexRequest, res: Response) {
    // When you send -> userId1
    // When you receive -> userId2

    const userId = req.userId as number;

    const friends = await prisma.user.findMany({
      where: {
        OR: [
          {
            user1: { some: { userId2: userId } },
          },
          {
            user2: { some: { userId1: userId } },
          },
        ],
      },
    });

    return res.json(friends);
  }
}

export default new FriendController();

// show user
// index reserves
// index friends
// index invites
// index invites/pending

// setup
