import { Response } from 'express';

import friendConfig from '~/config/friend';

import { RequestAuthBody, RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { assertUserEnrollmentExists } from '../UserController/tradingRules';
import { assertInviteExists, assertIsSenderOrReceiverId, assertUserIsNotFriend } from './tradingRules';

interface StoreInvite {
  receiverEnrollment: string;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreInvite>;
type DeleteRequest = RequestAuthParamsId;

class InviteController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const invites = await prisma.invite.findMany({
      where: { receiverId: userId },
      include: {
        UserReceiver: true,
        UserSender: true,
      },
    });

    const invitesFormatted = invites.map((invite) => {
      return {
        id: invite.id,
        receiver: invite.UserReceiver,
        sender: invite.UserSender,
        status: invite.status,
      };
    });

    return res.json(invitesFormatted);
  }

  async indexPending(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const invites = await prisma.invite.findMany({
      where: { senderId: userId },
      include: {
        UserReceiver: true,
        UserSender: true,
      },
    });
    const invitesFormatted = invites.map((invite) => {
      return {
        id: invite.id,
        receiver: invite.UserReceiver,
        sender: invite.UserSender,
        status: invite.status,
      };
    });

    return res.json(invitesFormatted);
  }

  async store(req: StoreRequest, res: Response) {
    const { receiverEnrollment } = req.body;

    const userId = req.userId as number;

    try {
      const userReceiver = await assertUserEnrollmentExists(receiverEnrollment);
      await assertUserIsNotFriend(userId, userReceiver.id);

      const [invite] = await prisma.invite.findMany({
        where: { senderId: userId, receiverId: userReceiver.id },
      });

      if (invite == null) {
        const inviteCreated = await prisma.invite.create({
          data: {
            UserSender: { connect: { id: userId } },
            UserReceiver: { connect: { id: userReceiver.id } },
            status: friendConfig.statusPending,
          },
        });

        return res.json(inviteCreated);
      }

      const inviteUpdated = await prisma.invite.update({
        where: {
          id: invite.id,
        },
        data: {
          status: friendConfig.statusPending,
        },
      });

      return res.json(inviteUpdated);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.userId as number;

    try {
      const invite = await assertInviteExists(id);
      await assertIsSenderOrReceiverId(userId, invite);

      const updatedInvite = await prisma.invite.update({
        where: { id },
        data: {
          status: friendConfig.statusDenied,
        },
      });
      return res.json(updatedInvite);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}
export default new InviteController();
