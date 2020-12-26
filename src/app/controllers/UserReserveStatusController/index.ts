import { Response } from 'express';

import reserveConfig from '~/config/reserve';

import { RequestAuthParams } from '~/types/auth';

import { updateUserReserveStatus } from './utils';

type UserReserveDelete = {
  reserveId: string;
};

type PostRequest = RequestAuthParams<UserReserveDelete>;

class UserReserveController {
  async accept(req: PostRequest, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.reserveId);

    try {
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
