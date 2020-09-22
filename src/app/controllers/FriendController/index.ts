import { Response } from 'express';

import { RequestAuthBody, RequestAuth } from '~/types/auth';

import prisma from '~/prisma';

interface StoreInvite {
  recipientId: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreInvite>;

class FriendController {
  async index(req: IndexRequest, res: Response) {
    // Vc manda a solicitação 'user1'
    // Vc aceita a solicitação 'user2'

    const userId = req.userId as number;

    const findFriendsUser1 = await prisma.friend.findMany({
      where: { userId1: userId },
    });

    const findFriendsUser2 = await prisma.friend.findMany({
      where: { userId2: userId },
    });

    const friends = [...findFriendsUser1, ...findFriendsUser2];

    return res.json(friends);
  }
}

export default new FriendController();
