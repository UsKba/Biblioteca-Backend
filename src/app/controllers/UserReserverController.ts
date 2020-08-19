import { Request, Response } from 'express';

import prisma from '~/prisma';

class UserReserverController {
  async index(req: Request, res: Response) {
    const userReserves = await prisma.userReserve.findMany({});

    return res.json(userReserves);
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.userReserve.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new UserReserverController();
