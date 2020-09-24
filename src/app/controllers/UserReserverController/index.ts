import { Request, Response } from 'express';

import prisma from '~/prisma';

class UserReserverController {
  async index(req: Request, res: Response) {
    const userReserves = await prisma.userReserves.findMany({});

    return res.json(userReserves);
  }

  async deleteAll(req: Request, res: Response) {
    await prisma.userReserves.deleteMany({});

    return res.json({ ok: true });
  }
}

export default new UserReserverController();
