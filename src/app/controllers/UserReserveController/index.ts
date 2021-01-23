import { Response } from 'express';

import { RequestError } from '~/app/errors/request';

import { RequestAuthParams } from '~/types/requestAuth';

import prisma from '~/prisma';

import {
  assertIsReserveLeader,
  assertReserveExists,
  assertUserIsOnReserve,
  checkHaveExactMinUsersOnReserve,
} from '../ReserveController/tradingRules';
import { deleteReserve, updateReserveLeader } from '../ReserveController/utils';

type UserReserveDelete = {
  reserveId: string;
  userId: string;
};

type DeleteRequest = RequestAuthParams<UserReserveDelete>;

class UserReserveController {
  async delete(req: DeleteRequest, res: Response) {
    const userId = req.userId as number;

    const userIdToDelete = Number(req.params.userId);
    const reserveId = Number(req.params.reserveId);

    try {
      const reserve = await assertReserveExists(reserveId);
      const userLoggedIsLeader = reserve.adminId === userId;

      assertUserIsOnReserve(userIdToDelete, reserve.userReserve);
      const haveMinUsersOnReserve = checkHaveExactMinUsersOnReserve(reserve.userReserve);

      if (userId === userIdToDelete) {
        if (haveMinUsersOnReserve) {
          await deleteReserve(reserveId);
        } else {
          await prisma.userReserve.deleteMany({
            where: {
              reserveId: reserve.id,
              userId: userIdToDelete,
            },
          });

          if (userLoggedIsLeader) {
            await updateReserveLeader(reserve);
          }
        }
        return res.json({ reserveId, userId: userIdToDelete });
      }

      await assertIsReserveLeader(userId, reserve);

      if (haveMinUsersOnReserve) {
        await deleteReserve(reserveId);
      } else {
        await prisma.userReserve.deleteMany({
          where: {
            reserveId: reserve.id,
            userId: userIdToDelete,
          },
        });
      }

      return res.json({ reserveId, userId: userIdToDelete });
    } catch (e) {
      const { statusCode, message } = e as RequestError;
      return res.status(statusCode).json({ error: message });
    }
  }
}

export default new UserReserveController();
