import { Request, Response } from 'express';

import { RequestBody } from '~/types/request';

import prisma from '~/prisma';

interface StoreBody {
  name: string;
}

type StoreRequest = RequestBody<StoreBody>;

class PeriodController {
  async index(req: Request, res: Response) {
    const periods = await prisma.period.findMany({});

    return res.json(periods);
  }

  async store(req: StoreRequest, res: Response) {
    const { name } = req.body;

    const period = await prisma.period.create({
      data: { name },
    });

    return res.json(period);
  }
}

export default new PeriodController();
