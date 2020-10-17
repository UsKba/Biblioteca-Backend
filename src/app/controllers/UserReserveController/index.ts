import { Response } from 'express';

import { RequestAuthParamsId } from '~/types/auth';

import prisma from '~/prisma';

class UserReserveController {
  async delete(req: RequestAuthParamsId, res: Response) {
    const userId = req.userId as number;
    const reserveId = Number(req.params.id);

    console.log(userId);
    console.log(reserveId);

    // await prisma.userReserve.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new UserReserveController();
