import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import friendConfig from '~/config/friend';

import { RequestAuthBody, RequestAuth, RequestAuthParamsId } from '~/types/requestAuth';

import prisma from '~/prisma';

import { assertUserIsNotFriend } from '../FriendController/tradingRules';
import { assertUserExists } from '../UserController/tradingRules';
import {
  assertFriendRequestExists,
  assertFriendRequestReceiverAlreadyNotSendOneToYou,
  assertIsSenderOrReceiverId,
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
      where: {
        senderId: userId,
        NOT: { status: friendConfig.statusDenied },
      },
      include: {
        userReceiver: { include: { color: true, role: true } },
        userSender: { include: { color: true, role: true } },
      },
    });

    const friendRequestsReceived = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        NOT: { status: friendConfig.statusDenied },
      },
      include: {
        userReceiver: { include: { color: true, role: true } },
        userSender: { include: { color: true, role: true } },
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

      const userReceiver = await assertUserExists({ enrollment: receiverEnrollment });
      await assertUserIsNotFriend(userId, userReceiver.id);
      await assertFriendRequestReceiverAlreadyNotSendOneToYou(userId, userReceiver.id);

      const [friendRequest] = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          receiverId: userReceiver.id,
        },
      });

      if (!friendRequest) {
        const friendRequestCreated = await prisma.friendRequest.create({
          data: {
            userSender: { connect: { id: userId } },
            userReceiver: { connect: { id: userReceiver.id } },
            status: friendConfig.statusPending,
          },
          include: {
            userReceiver: { include: { color: true, role: true } },
            userSender: { include: { color: true, role: true } },
          },
        });

        const friendRequestFormatted = formatFriendRequestToResponse(friendRequestCreated);

        return res.json(friendRequestFormatted);
      }

      const friendRequestUpdated = await prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: friendConfig.statusPending },
        include: {
          userReceiver: { include: { color: true, role: true } },
          userSender: { include: { color: true, role: true } },
        },
      });

      const friendRequestFormatted = formatFriendRequestToResponse(friendRequestUpdated);

      return res.json(friendRequestFormatted);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }

  async delete(req: DeleteRequest, res: Response) {
    const id = Number(req.params.id);
    const userId = req.userId as number;

    try {
      const friendRequest = await assertFriendRequestExists(id);
      assertIsSenderOrReceiverId(userId, friendRequest);

      const friendRequestUpdated = await prisma.friendRequest.update({
        where: { id },
        data: {
          status: friendConfig.statusDenied,
        },
      });

      return res.json(friendRequestUpdated);
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }
}
export default new FriendRequestController();
