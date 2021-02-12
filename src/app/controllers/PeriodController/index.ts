import { Response } from 'express';

import { RequestAuth, RequestAuthBody } from '~/types/requestAuth';

import prisma from '~/prisma';

interface StoreBody {
  name: string;
}

type IndexRequest = RequestAuth;
type StoreRequest = RequestAuthBody<StoreBody>;

class PeriodController {
  async index(req: IndexRequest, res: Response) {
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
