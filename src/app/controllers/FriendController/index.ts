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
    const friends = await prisma.friend.findMany({});

    return res.json(friends);
  }
}

export default new FriendController();
