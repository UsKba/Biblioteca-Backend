import { Response } from 'express';

import { RequestAuthBody, RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import friendConfig from '~/config/friend';

import { assertUserIdExists } from '../UserController/tradingRules';
import {
  assertInviteExists,
  assertIsSenderOrReceiverId,
  assertUserIsNotFriend,
} from './tradingRules';

interface StoreInvite {
  receiverId: number;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreInvite>;
type DeleteRequest = RequestAuthParamsId;

class InviteController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const invites = await prisma.invite.findMany({
      where: { receiverId: userId },
    });

    return res.json(invites);
  }

  async indexPending(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const invites = await prisma.invite.findMany({
      where: { senderId: userId },
    });

    return res.json(invites);
  }

  async store(req: StoreRequest, res: Response) {
    const { receiverId} = req.body;
    const userId = req.userId as number;

    try {
      await assertUserIdExists(receiverId);
      await assertUserIsNotFriend(userId, receiverId);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const [invite] = await prisma.invite.findMany({
      where: { senderId: userId, receiverId },
    });

    if(invite == null){

      const inviteCreated = await prisma.invite.create({
        data: {
          UserSender: { connect: { id: userId } },
          UserReceiver: { connect: { id: receiverId } },
          status: friendConfig.statusPending ,
        },
      });

      return res.json(inviteCreated);
    }

    const inviteUpdated = await prisma.invite.update({
      where : {
        id: invite.id ,
      },
      data: {
        status: friendConfig.statusPending,
      }
    });

    return res.json(inviteUpdated);
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.userId as number;

    try {
      const inivite = await assertInviteExists(id);
      await assertIsSenderOrReceiverId(userId, inivite);

      await prisma.invite.update({
        where: { id },
        data :  {
          status: friendConfig.statusDenied,
        }

      });
      return res.json({ id });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new InviteController();
