import { Response } from 'express';

import reserveConfig from '~/config/reserve';

import { RequestAuthParams } from '~/types/auth';

import { assertReserveExists, assertUserIsOnReserve } from '../ReserveController/tradingRules';
import { deleteReserve } from '../ReserveController/utils';
import {
  assertNowIsBeforeOfReserve,
  assertUserAlreadyNotRefusedReserve,
  checkHaveTheMinimumRequiredUsersThatNotRefused,
} from './tradingRules';
import { updateUserReserveStatus } from './utils';

type UserReserveStatusPost = {
  reserveId: string;
};

type PostRequest = RequestAuthParams<UserReserveStatusPost>;

class UserReserveController {
  async accept(req: PostRequest, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.reserveId);

    try {
      const reserve = await assertReserveExists(reserveId);
      assertUserIsOnReserve(userId, reserve.userReserve);
      assertNowIsBeforeOfReserve(reserve);

      const userReserveFormatted = await updateUserReserveStatus(
        reserveId,
        userId,
        reserveConfig.userReserve.statusAccepted
      );

      return res.json(userReserveFormatted);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }

  async refuse(req: PostRequest, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.reserveId);

    try {
      const reserve = await assertReserveExists(reserveId);
      assertUserIsOnReserve(userId, reserve.userReserve);
      assertUserAlreadyNotRefusedReserve(userId, reserve);

      const haveMinimumUsersRequired = checkHaveTheMinimumRequiredUsersThatNotRefused(reserve);

      if (!haveMinimumUsersRequired) {
        await deleteReserve(reserveId);

        return res.json({ reserveId });
      }

      const userReserveFormatted = await updateUserReserveStatus(
        reserveId,
        userId,
        reserveConfig.userReserve.statusRefused
      );

      return res.json(userReserveFormatted);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new UserReserveController();
