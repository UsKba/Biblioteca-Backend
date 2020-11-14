import { Response } from 'express';

import { RequestAuthParams } from '~/types/auth';

import prisma from '~/prisma';

import {
  assertIsReserveLeader,
  assertReserveExists,
  assertCanRemoveUserFromReserve,
  assertUserIsOnReserve,
  uptateReserveLeader,
} from '../ReserveController/tradingRules';

type UserReserveDelete = {
  reserveId: string;
  userId: string;
};

type DeleteRequest = RequestAuthParams<UserReserveDelete>;

class UserReserveController {
  async delete(req: DeleteRequest, res: Response) {
    const userId = req.userId as number;//Lider da reserva

    const userIdToDelete = Number(req.params.userId);
    const reserveId = Number(req.params.reserveId);

    try {
      const reserve = await assertReserveExists(reserveId);

      assertUserIsOnReserve(userIdToDelete, reserve.UserReserve);
      assertCanRemoveUserFromReserve(reserve.UserReserve);

      await assertIsReserveLeader(userId, reserve);

      await prisma.userReserve.deleteMany({
        where: {
          reserveId: reserve.id,
          userId: userIdToDelete,
        },
      });

      if (reserve.adminId === userIdToDelete) {
        await uptateReserveLeader(reserve);
        }

      return res.json({ reserveId, userId: userIdToDelete });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new UserReserveController();
