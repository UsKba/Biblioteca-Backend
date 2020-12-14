import { Response } from 'express';

import friendConfig from '~/config/friend';

import { RequestAuthBody, RequestAuth, RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

import { assertUserEnrollmentExists } from '../UserController/tradingRules';
import {
  assertFriendRequestExists,
  assertIsSenderOrReceiverId,
  assertUserIsNotFriend,
  assertUserLoggedAndFriendRequestReceiverAreDifferent,
} from './tradingRules';
import { formatFriendRequestToResponse } from './utils';

interface StoreFriendRequest {
  receiverEnrollment: string;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreFriendRequest>;
type DeleteRequest = RequestAuthParamsId;

class FriendRequestController {
  async index(req: IndexRequest, res: Response) {
    const userId = req.userId as number;

    const friendRequestsSent = await prisma.friendRequest.findMany({
      where: { senderId: userId },
      include: {
        UserReceiver: true,
        UserSender: true,
      },
    });

    const friendRequestsReceived = await prisma.friendRequest.findMany({
      where: { receiverId: userId },
      include: {
        UserReceiver: true,
        UserSender: true,
      },
    });

    const friendRequestsSentFormatted = friendRequestsSent.map(formatFriendRequestToResponse);
    const friendRequestsReceivedFormatted = friendRequestsReceived.map(formatFriendRequestToResponse);

    return res.json({
      sent: friendRequestsSentFormatted,
      received: friendRequestsReceivedFormatted,
    });
  }

  async store(req: StoreRequest, res: Response) {
    const { receiverEnrollment } = req.body;

    const userId = req.userId as number;
    const userEnrollment = req.userEnrollment as string;

    try {
      assertUserLoggedAndFriendRequestReceiverAreDifferent(userEnrollment, receiverEnrollment);

      const userReceiver = await assertUserEnrollmentExists(receiverEnrollment);
      await assertUserIsNotFriend(userId, userReceiver.id);

      const [friendRequest] = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          receiverId: userReceiver.id,
        },
      });

      if (friendRequest == null) {
        const friendRequestCreated = await prisma.friendRequest.create({
          data: {
            UserSender: { connect: { id: userId } },
            UserReceiver: { connect: { id: userReceiver.id } },
            status: friendConfig.statusPending,
          },
          include: {
            UserReceiver: true,
            UserSender: true,
          },
        });

        const friendRequestFormatted = formatFriendRequestToResponse(friendRequestCreated);

        return res.json(friendRequestFormatted);
      }

      const friendRequestUpdated = await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: friendConfig.statusPending },
        include: {
          UserReceiver: true,
          UserSender: true,
        },
      });

      const friendRequestFormatted = formatFriendRequestToResponse(friendRequestUpdated);

      return res.json(friendRequestFormatted);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.userId as number;

    try {
      const friendRequest = await assertFriendRequestExists(id);
      await assertIsSenderOrReceiverId(userId, friendRequest);

      const friendRequestUpdated = await prisma.friendRequest.update({
        where: { id },
        data: {
          status: friendConfig.statusDenied,
        },
      });
      return res.json(friendRequestUpdated);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}
export default new FriendRequestController();
